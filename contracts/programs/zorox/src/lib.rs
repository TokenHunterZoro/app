use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("5pj7QiUhJyqeYQv64pCNzVs2X8LfU2fGpBAKAE3c718p");

#[program]
pub mod subscription_contract {
    use super::*;

    pub const FEE_AMOUNT: u64 = 100_000_000; // 0.1 SOL in lamports
    pub const BONK_FEE_AMOUNT: u64 = 100_000_000_000; // 100 BONK in lamports
    pub const WEEK_IN_SECONDS: i64 = 604800;

    #[state]
    pub struct SubscriptionState {
        pub owner: Pubkey,
        pub subscriptions: Vec<Subscription>,
    }

    #[derive(AnchorSerialize, AnchorDeserialize, Clone)]
    pub struct Subscription {
        pub user: Pubkey,
        pub expiry: i64,
    }

    #[derive(Accounts)]
    pub struct Initialize<'info> {
        #[account(init, payer = owner, space = 8 + 32 + 1000)]
        pub state: Account<'info, SubscriptionState>,
        pub owner: Signer<'info>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct SubscribeWithSol<'info> {
        #[account(mut)]
        pub state: Account<'info, SubscriptionState>,
        #[account(mut)]
        pub user: Signer<'info>,
        #[account(mut)]
        pub vault: SystemAccount<'info>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct SubscribeWithBonk<'info> {
        #[account(mut)]
        pub state: Account<'info, SubscriptionState>,
        #[account(mut)]
        pub user: Signer<'info>,
        #[account(mut)]
        pub user_token_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub vault_token_account: Account<'info, TokenAccount>,
        pub token_program: Program<'info, Token>,
    }

    #[derive(Accounts)]
    pub struct WithdrawFunds<'info> {
        #[account(mut, has_one = owner)]
        pub state: Account<'info, SubscriptionState>,
        #[account(mut)]
        pub owner: Signer<'info>,
        #[account(mut)]
        pub vault: SystemAccount<'info>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct ChangeOwner<'info> {
        #[account(mut, has_one = owner)]
        pub state: Account<'info, SubscriptionState>,
        pub owner: Signer<'info>,
        /// CHECK: New owner's address
        pub new_owner: AccountInfo<'info>,
    }

    impl SubscriptionState {
        pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
            let state = &mut ctx.accounts.state;
            state.owner = ctx.accounts.owner.key();
            state.subscriptions = Vec::new();
            Ok(())
        }

        pub fn subscribe_with_sol(ctx: Context<SubscribeWithSol>, weeks: u64) -> Result<()> {
            let state = &mut ctx.accounts.state;
            let total_fee = FEE_AMOUNT.checked_mul(weeks).unwrap();
            
            // Transfer SOL to vault
            let ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.vault.key(),
                total_fee,
            );
            anchor_lang::solana_program::program::invoke(
                &ix,
                &[
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                ],
            )?;

            // Update subscription
            let clock = Clock::get()?;
            let expiry = clock.unix_timestamp + (WEEK_IN_SECONDS * weeks as i64);
            
            if let Some(sub) = state.subscriptions.iter_mut().find(|s| s.user == ctx.accounts.user.key()) {
                sub.expiry = expiry;
            } else {
                state.subscriptions.push(Subscription {
                    user: ctx.accounts.user.key(),
                    expiry,
                });
            }
            
            Ok(())
        }

        pub fn subscribe_with_bonk(ctx: Context<SubscribeWithBonk>, weeks: u64) -> Result<()> {
            let state = &mut ctx.accounts.state;
            let total_fee = BONK_FEE_AMOUNT.checked_mul(weeks).unwrap();
            
            // Transfer Bonk tokens to vault
            let transfer_ix = Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    transfer_ix,
                ),
                total_fee,
            )?;

            // Update subscription
            let clock = Clock::get()?;
            let expiry = clock.unix_timestamp + (WEEK_IN_SECONDS * weeks as i64);
            
            if let Some(sub) = state.subscriptions.iter_mut().find(|s| s.user == ctx.accounts.user.key()) {
                sub.expiry = expiry;
            } else {
                state.subscriptions.push(Subscription {
                    user: ctx.accounts.user.key(),
                    expiry,
                });
            }
            
            Ok(())
        }

        pub fn get_subscription_time(ctx: Context<State>, user: Pubkey) -> Result<i64> {
            let state = &ctx.accounts.state;
            let clock = Clock::get()?;
            
            if let Some(sub) = state.subscriptions.iter().find(|s| s.user == user) {
                let remaining = sub.expiry - clock.unix_timestamp;
                Ok(if remaining > 0 { remaining } else { 0 })
            } else {
                Ok(0)
            }
        }

        pub fn withdraw(ctx: Context<WithdrawFunds>) -> Result<()> {
            let amount = ctx.accounts.vault.lamports();
            **ctx.accounts.vault.try_borrow_mut_lamports()? -= amount;
            **ctx.accounts.owner.try_borrow_mut_lamports()? += amount;
            Ok(())
        }

        pub fn change_owner(ctx: Context<ChangeOwner>) -> Result<()> {
            let state = &mut ctx.accounts.state;
            state.owner = ctx.accounts.new_owner.key();
            Ok(())
        }
    }
}