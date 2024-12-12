## TODO

1. Fetch videos by hashtag too
2. Get all Pumpfun coins from Bitquery.
3. Get last 24 hour coins from Bitquery.
4. Group memecoins to memes.
5. Try pattern matching the last 24 hour crypto with scraped data
6. Display in the UI.
7. Analyze running time, can be faster?

## DONE

1. Fix comments scraping
2. Structure code in folders
3. Remove duplicate comments by the same person.
4. Try to get ticker mentions in comments and captions. get the metric.

## BitQuery queries

1. Get active creations
2. Get active trades that happen currently
3. Get all memecoin creations

## Schemas

CREATE TABLE prices (
id INT8 PRIMARY KEY,
token_id INT8,
trade_at TIMESTAMPTZ,
price_usd NUMERIC,
price_sol NUMERIC,
market_cap NUMERIC,
price_token_id_fkey INT8,
FOREIGN KEY (price_token_id_fkey) REFERENCES public.tokens(id)
);

CREATE TABLE tokens (
id INT8 PRIMARY KEY,
name VARCHAR,
symbol VARCHAR,
uri VARCHAR,
created_at TIMESTAMPTZ,
address VARCHAR,
create_tx VARCHAR,
mentions NUMERIC DEFAULT '0'::NUMERIC,
views NUMERIC DEFAULT '0'::NUMERIC
);
