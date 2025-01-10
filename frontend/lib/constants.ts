import { DocsConfig } from "./types";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
const TEST_BONK_TOKEN_MINT_ADDRESS =
  "J5xh6VWTmNmgVmhgGqEd6fgzZunt2hPqLmiXB85C5Wna";

const pumpfunSample = {
  extraction_time: "2024-12-11 16:35:15",
  total_searches: 1,
  results: {
    pumpfun: {
      total_videos: 6,
      videos: [
        {
          posted_time: "4h ago",
          posted_timestamp: 1733891681.760984,
          video_url:
            "https://www.tiktok.com/@dkbattleandnews/video/7447004775004146990",
          thumbnail_url:
            "https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/owf7yeeAHACE1bADgODBkOQnsIlZ7JrEiFcECF?lk3s=b59d6b55&x-expires=1734076800&x-signature=UC7CZDY3Cau19IZ8sjQ0WRdrHQE%3D&shp=b59d6b55&shcp=-",
          description:
            "Doge Meet Cat aka DMC ticker currently on pump fun. Discord link in bio come join a great hard workin community.",
          hashtags: [],
          author: "",
          views: "",
          extracted_time: "2024-12-11 16:34:41",
          comments: {
            count: 5,
            tickers: {
              DMC: 2,
            },
            data: [
              "everyone still sleepin on kitcat, wild",
              "Hell yea",
              "$DMC TO THE 🚀 🌕",
              "$kitcat 🚀🔥🔥🔥🌕🔥",
              "solana memes have leveled up. kitcat added ai tech",
            ],
          },
        },
        {
          posted_time: "4h ago",
          posted_timestamp: 1733891682.31884,
          video_url:
            "https://www.tiktok.com/@dkbattleandnews/video/7447004549753212202",
          thumbnail_url:
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/43b64c16adf78921aab4f3fb493b6f6f~c5_100x100.jpeg?lk3s=a5d48078&nonce=17678&refresh_token=50c2f075f52a3f5a0fd86e954e97ed22&x-expires=1734076800&x-signature=gvoBAq54ydVhx%2F0OdPteOE05img%3D&shp=a5d48078&shcp=b59d6b55",
          description:
            "Discord link in bio Doge Meet Cat aka DMC currently on pump fun get in early and become part of a hard working community. #mem",
          hashtags: [],
          author: "",
          views: "",
          extracted_time: "2024-12-11 16:34:42",
          comments: {
            count: 3,
            tickers: {
              DMC: 2,
            },
            data: ["🤣🤣", "$Dmc", "$DMC"],
          },
        },
        {
          posted_time: "4h ago",
          posted_timestamp: 1733891682.834023,
          video_url:
            "https://www.tiktok.com/@j4bbing/video/7446996058183306514",
          thumbnail_url:
            "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/tos-alisg-avt-0068/53a5056c13d10442666fad18102f3e08.jpeg?lk3s=a5d48078&nonce=92783&refresh_token=0c51e946854d2f4c1a315cbd8b5f5791&x-expires=1734076800&x-signature=OD6nDH%2FJzci56bn9vrl8EhME32Y%3D&shp=a5d48078&shcp=b59d6b55",
          description: "live now on pump.fun $TRENCHES 📈",
          hashtags: ["#crypto", "#bitcoin"],
          author: "",
          views: "",
          extracted_time: "2024-12-11 16:34:42",
          comments: {
            count: 6,
            tickers: {
              NOW: 1,
            },
            data: [
              "bro buy kitcat NOW 💰",
              "These dips don’t scare me, buying kitcat",
              "Shall I buy $kitcat?",
              "Already up 3x on $kitcat, and I’m still holding",
              "$kitcat is IT rn 🔥🔥🔥🔥",
              "Check out $OpiumPepe. Got a great community behind it and recently got the whales out of the coin it’s ready to launch. 🚀 🐸🚀",
            ],
          },
        },
        {
          posted_time: "20h ago",
          posted_timestamp: 1733834085.680062,
          video_url:
            "https://www.tiktok.com/@pump.fun/video/7446749979323976992",
          thumbnail_url:
            "https://p16-sign-useast2a.tiktokcdn.com/obj/tos-useast2a-p-0037-euttp/oca7YAMACPBFhEInxWFfDBQN3KEurUEeRBDnEb?lk3s=b59d6b55&x-expires=1734076800&x-signature=80WDbHlB1Gv6L%2FlYG5ar6lENQrE%3D&shp=b59d6b55&shcp=-",
          description: "no, no we should not",
          hashtags: ["#tradingtiktok", "#parlay", "#meme"],
          author: "",
          views: "",
          extracted_time: "2024-12-11 16:34:45",
          comments: {
            count: 17,
            tickers: {
              NYRIZZ: 1,
              LIL: 2,
              BRO: 1,
              KINGJALUCE: 2,
              DUMPMAS: 2,
              ROT: 2,
              GHOST: 1,
              CHUNGS: 2,
              BOUT: 1,
              MAKE: 1,
              ME: 1,
              RICH: 1,
            },
            data: [
              "NYRIZZ🚀’s comment: We early🚨",
              "TheBullReefer’s comment: Alon stop they will really believe they should 😭",
              "Zeph’s comment: am i verified?",
              "Hantz’s comment: $LIL BRO",
              "vis_onlyyy’s comment: if anyone wants to trade memecoins, join trojan by my referral.\nping me",
              "Rhys Thomas’s comment: $KINGJALUCE 🚀 for all of his predictions",
              "stfn.ia’s comment: $DUMPMAS",
              "SOOTcoin’s comment: Soot😏😏",
              "S0LGUY’s comment: That’s why u gotta do rug pulls instead like me",
              "Just.Benji’s comment: How pumpfun keep posting these bangers",
              "Luca’s comment: Spacexdoge",
              "bloody.marion’s comment: lol scams",
              "GHOST’s comment: The best meme coin to hold $ROT",
              "to the moon’s comment: $CHUNGS BOUT TO MAKE ME RICH",
              "BoBo’s comment: They all scammers and ruggers especially legion",
              "itzmmzatherealtor’s comment: $dumpfun",
              "Mestre Ensinador’s comment: $Tiburcio",
            ],
          },
        },
        {
          posted_time: "11h ago",
          posted_timestamp: 1733866494.031466,
          video_url:
            "https://www.tiktok.com/@tommy.crypto12/video/7446895504589475094",
          thumbnail_url:
            "https://p16-pu-sign-no.tiktokcdn-eu.com/obj/tos-no1a-p-0037-no/oUFfAbXOsA3NLlXBEf2V5jsDIWYfIDnsIGbAED?lk3s=b59d6b55&x-expires=1734076800&x-signature=KM3328m2v14CPKmg2P0YuoLWNJ0%3D&shp=b59d6b55&shcp=-",
          description: "",
          hashtags: ["#XRP", "#bitcoin", "#trading", "#crypto", "#memecoin"],
          author: "",
          views: "",
          extracted_time: "2024-12-11 16:34:54",
          comments: {
            count: 36,
            tickers: {
              DIEGO: 4,
              BRLM: 4,
              XRP: 2,
              STOP: 1,
              GOING: 1,
            },
            data: [
              "Rabeya Symon’s comment: nice",
              "$DIEGO’s comment: $DIEGO",
              "Rabeya Symon’s comment: 🥰🥰🥰",
              "Manan’s comment: 😁😁😁",
              "maddevimusic’s comment: 🔥🔥 Guys $BRLM Breloom to the moon 🌛🚀 its blowing up!!! 💥💥",
              "Дима’s comment: Bet kitcat",
              "Roza Lolo’s comment: ur portfolio needs $kitcat. buy it.",
              "sasa’s comment: holding $kitcat tight 💎🔥🔥🔥🔥",
              "Friendly lip’s comment: lol imagine not holding $kitcat rn. memes and ai? come on",
              "mila56.4’s comment: buy $kitcat now 🔥",
              "RippleMoon’s comment: 🚀XMoon🚀 Join our meme coin XRP Army as we are powered by the rise of XRP to the moon! 🌚",
              "mondahatem’s comment: Every week, I’m more bullish on kitcat",
              "Sarowar’s comment: 💎💎 $kitcat moon 🌕🔥🚀",
              "Rabeya Symon’s comment: 🔥🔥 Guys $BRLM Breloom to the moon 🌛🚀 its blowing up!!! 💥💥",
              "Muhammad Ali’s comment: these ai cats are cooking something big. kitcat to the moon",
              "child@ayan.umar’s comment: LFG $kitcat fam 🌕🔥🔥🚀",
              "Mohammad Rubel’s comment: STOP scrolling & buy kitcat!!!",
              "mima12121’s comment: buy $kitcat or you’ll regret it",
              "milanka’s comment: idk what’s crazier, the ai agent or the memes. kitcat",
              "Farida Ali’s comment: too early to stop… buy kitcat",
              "Join my telegram group!! Daily calls and we are going to push coins ‼️Link in bio🚀🚀",
              "Phantom Plus GOING TO MOON🔥🔥",
              "$Santasol! Going crazy!!",
              "67k in 3 hours copying @Andrew Willis trade. He’s a true trading genius!",
              "solana memes aren’t playing anymore. kitcat added ai",
              "My portfolio? Mostly $kitcat",
              "$kitcat bag looking fat rn 🤑",
              "holding tight bc this ai stuff on $kitcat is no joke",
              "kitcat fam let’s get it 💪",
              "$kitcat made my wallet look happy today",
              "Been in crypto for years, $kitcat feels different",
              "🔥🔥🔥🔥",
              "kitcat gonna hit",
              "The future of crypto? Projects like kitcat",
              "Check out $OpiumPepe. Got a great community behind it and recently got the whales out of the coin it’s ready to launch. 🚀 🐸🚀",
              "😏",
            ],
          },
        },
        {
          posted_time: "3h ago",
          posted_timestamp: 1733895300.842005,
          video_url:
            "https://www.tiktok.com/@forever1loveboystory/video/7447014382183222546",
          thumbnail_url:
            "https://p16-sign-sg.tiktokcdn.com/obj/tos-alisg-p-0037/oMfn6uRCEsDWAyeEVOFwiIAEBwAFQgC5RAAUwA?lk3s=b59d6b55&x-expires=1734076800&x-signature=wB17aoDMDS6iJr%2FjR4xN1vITYK0%3D&shp=b59d6b55&shcp=-",
          description:
            "What's so fun about Pump !t Up 🕹️⬆️behind the scenes?It's so much fun",
          hashtags: [],
          author: "",
          views: "",
          extracted_time: "2024-12-11 16:35:00",
          comments: {
            count: 0,
            tickers: {},
            data: [],
          },
        },
      ],
    },
  },
};
const ITEMS_PER_PAGE = 20;

const IPFS_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";
const IPFS_GATEWAY_URL_2 = "https://ipfs.io/ipfs/";
const IPFS_GATEWAY_URL_3 = "https://dweb.link/ipfs/";
const IPFS_GATEWAY_URL_4 = "https://nftstorage.link/ipfs/";

const DUMMY_HERO_TABLE_DATA = [
  {
    position: 1,
    image: "https://picsum.photos/40",
    ticker: "SAMO",
    price: "$0.0021",
    age: "11hr",
    volume: "$21.0M",
    views: "2.5k",
    mentions: "100k",
    marketCap: "$50.2M",
  },
  {
    position: 2,
    image: "https://picsum.photos/40",
    ticker: "DOGE",
    price: "$0.0013",
    age: "2d",
    volume: "$10.4M",
    views: "1.8k",
    mentions: "80k",
    marketCap: "$30.1M",
  },
  {
    position: 3,
    image: "https://picsum.photos/40",
    ticker: "INU",
    price: "$0.0009",
    age: "3d",
    volume: "$5.2M",
    views: "1.2k",
    mentions: "60k",
    marketCap: "$15.0M",
  },
  {
    position: 4,
    image: "https://picsum.photos/40",
    ticker: "KISHU",
    price: "$0.0001",
    age: "5hr",
    volume: "$3.7M",
    views: "950",
    mentions: "45k",
    marketCap: "$10.5M",
  },
  {
    position: 5,
    image: "https://picsum.photos/40",
    ticker: "ELON",
    price: "$0.0004",
    age: "1d",
    volume: "$7.1M",
    views: "1.3k",
    mentions: "70k",
    marketCap: "$25.8M",
  },
  {
    position: 6,
    image: "https://picsum.photos/40",
    ticker: "CINU",
    price: "$0.0029",
    age: "3hr",
    volume: "$15.4M",
    views: "2.9k",
    mentions: "110k",
    marketCap: "$40.3M",
  },
  {
    position: 7,
    image: "https://picsum.photos/40",
    ticker: "HOGE",
    price: "$0.0017",
    age: "12hr",
    volume: "$4.9M",
    views: "1.7k",
    mentions: "55k",
    marketCap: "$18.6M",
  },
  {
    position: 8,
    image: "https://picsum.photos/40",
    ticker: "SHIB",
    price: "$0.0007",
    age: "2d",
    volume: "$12.0M",
    views: "3.2k",
    mentions: "150k",
    marketCap: "$60.4M",
  },
  {
    position: 9,
    image: "https://picsum.photos/40",
    ticker: "FLOKI",
    price: "$0.0032",
    age: "8hr",
    volume: "$8.5M",
    views: "1.6k",
    mentions: "90k",
    marketCap: "$22.7M",
  },
  {
    position: 10,
    image: "https://picsum.photos/40",
    ticker: "PEPE",
    price: "$0.0005",
    age: "4d",
    volume: "$6.8M",
    views: "1.1k",
    mentions: "65k",
    marketCap: "$14.9M",
  },
];

const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Components",
      href: "/docs/components/accordion",
    },
    {
      title: "Blocks",
      href: "/blocks",
    },
    {
      title: "Charts",
      href: "/charts",
    },
    {
      title: "Themes",
      href: "/themes",
    },
    {
      title: "Colors",
      href: "/colors",
    },
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
          items: [],
        },
        {
          title: "Installation",
          href: "/docs/installation",
          items: [],
        },
        {
          title: "components.json",
          href: "/docs/components-json",
          items: [],
        },
        {
          title: "Theming",
          href: "/docs/theming",
          items: [],
        },
        {
          title: "Dark mode",
          href: "/docs/dark-mode",
          items: [],
        },
        {
          title: "CLI",
          href: "/docs/cli",
          items: [],
        },
        {
          title: "Next.js 15 + React 19",
          href: "/docs/react-19",
          items: [],
        },
        {
          title: "Typography",
          href: "/docs/components/typography",
          items: [],
        },
        {
          title: "Open in v0",
          href: "/docs/v0",
          items: [],
        },
        {
          title: "Figma",
          href: "/docs/figma",
          items: [],
        },
        {
          title: "Changelog",
          href: "/docs/changelog",
          items: [],
        },
      ],
    },
    {
      title: "Installation",
      items: [
        {
          title: "Next.js",
          href: "/docs/installation/next",
          items: [],
        },
        {
          title: "Vite",
          href: "/docs/installation/vite",
          items: [],
        },
        {
          title: "Remix",
          href: "/docs/installation/remix",
          items: [],
        },
        {
          title: "Astro",
          href: "/docs/installation/astro",
          items: [],
        },
        {
          title: "Laravel",
          href: "/docs/installation/laravel",
          items: [],
        },
        {
          title: "Gatsby",
          href: "/docs/installation/gatsby",
          items: [],
        },
        {
          title: "Manual",
          href: "/docs/installation/manual",
          items: [],
        },
      ],
    },
    {
      title: "Components",
      items: [
        {
          title: "Sidebar",
          href: "/docs/components/sidebar",
          items: [],
          label: "New",
        },
        {
          title: "Accordion",
          href: "/docs/components/accordion",
          items: [],
        },
        {
          title: "Alert",
          href: "/docs/components/alert",
          items: [],
        },
        {
          title: "Alert Dialog",
          href: "/docs/components/alert-dialog",
          items: [],
        },
        {
          title: "Aspect Ratio",
          href: "/docs/components/aspect-ratio",
          items: [],
        },
        {
          title: "Avatar",
          href: "/docs/components/avatar",
          items: [],
        },
        {
          title: "Badge",
          href: "/docs/components/badge",
          items: [],
        },
        {
          title: "Breadcrumb",
          href: "/docs/components/breadcrumb",
          items: [],
        },
        {
          title: "Button",
          href: "/docs/components/button",
          items: [],
        },
        {
          title: "Calendar",
          href: "/docs/components/calendar",
          items: [],
        },
        {
          title: "Card",
          href: "/docs/components/card",
          items: [],
        },
        {
          title: "Carousel",
          href: "/docs/components/carousel",
          items: [],
        },
        {
          title: "Chart",
          href: "/docs/components/chart",
          items: [],
        },
        {
          title: "Checkbox",
          href: "/docs/components/checkbox",
          items: [],
        },
        {
          title: "Collapsible",
          href: "/docs/components/collapsible",
          items: [],
        },
        {
          title: "Combobox",
          href: "/docs/components/combobox",
          items: [],
        },
        {
          title: "Command",
          href: "/docs/components/command",
          items: [],
        },
        {
          title: "Context Menu",
          href: "/docs/components/context-menu",
          items: [],
        },
        {
          title: "Data Table",
          href: "/docs/components/data-table",
          items: [],
        },
        {
          title: "Date Picker",
          href: "/docs/components/date-picker",
          items: [],
        },
        {
          title: "Dialog",
          href: "/docs/components/dialog",
          items: [],
        },
        {
          title: "Drawer",
          href: "/docs/components/drawer",
          items: [],
        },
        {
          title: "Dropdown Menu",
          href: "/docs/components/dropdown-menu",
          items: [],
        },
        {
          title: "Form",
          href: "/docs/components/form",
          items: [],
        },
        {
          title: "Hover Card",
          href: "/docs/components/hover-card",
          items: [],
        },
        {
          title: "Input",
          href: "/docs/components/input",
          items: [],
        },
        {
          title: "Input OTP",
          href: "/docs/components/input-otp",
          items: [],
        },
        {
          title: "Label",
          href: "/docs/components/label",
          items: [],
        },
        {
          title: "Menubar",
          href: "/docs/components/menubar",
          items: [],
        },
        {
          title: "Navigation Menu",
          href: "/docs/components/navigation-menu",
          items: [],
        },
        {
          title: "Pagination",
          href: "/docs/components/pagination",
          items: [],
        },
        {
          title: "Popover",
          href: "/docs/components/popover",
          items: [],
        },
        {
          title: "Progress",
          href: "/docs/components/progress",
          items: [],
        },
        {
          title: "Radio Group",
          href: "/docs/components/radio-group",
          items: [],
        },
        {
          title: "Resizable",
          href: "/docs/components/resizable",
          items: [],
        },
        {
          title: "Scroll Area",
          href: "/docs/components/scroll-area",
          items: [],
        },
        {
          title: "Select",
          href: "/docs/components/select",
          items: [],
        },
        {
          title: "Separator",
          href: "/docs/components/separator",
          items: [],
        },
        {
          title: "Sheet",
          href: "/docs/components/sheet",
          items: [],
        },
        {
          title: "Skeleton",
          href: "/docs/components/skeleton",
          items: [],
        },
        {
          title: "Slider",
          href: "/docs/components/slider",
          items: [],
        },
        {
          title: "Sonner",
          href: "/docs/components/sonner",
          items: [],
        },
        {
          title: "Switch",
          href: "/docs/components/switch",
          items: [],
        },
        {
          title: "Table",
          href: "/docs/components/table",
          items: [],
        },
        {
          title: "Tabs",
          href: "/docs/components/tabs",
          items: [],
        },
        {
          title: "Textarea",
          href: "/docs/components/textarea",
          items: [],
        },
        {
          title: "Toast",
          href: "/docs/components/toast",
          items: [],
        },
        {
          title: "Toggle",
          href: "/docs/components/toggle",
          items: [],
        },
        {
          title: "Toggle Group",
          href: "/docs/components/toggle-group",
          items: [],
        },
        {
          title: "Tooltip",
          href: "/docs/components/tooltip",
          items: [],
        },
      ],
    },
  ],
  chartsNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs/charts",
          items: [],
        },
        {
          title: "Installation",
          href: "/docs/charts/installation",
          items: [],
        },
        {
          title: "Theming",
          href: "/docs/charts/theming",
          items: [],
        },
      ],
    },
    {
      title: "Charts",
      items: [
        {
          title: "Area Chart",
          href: "/docs/charts/area",
          items: [],
        },
        {
          title: "Bar Chart",
          href: "/docs/charts/bar",
          items: [],
        },
        {
          title: "Line Chart",
          href: "/docs/charts/line",
          items: [],
        },
        {
          title: "Pie Chart",
          href: "/docs/charts/pie",
          items: [],
        },
        {
          title: "Radar Chart",
          href: "/docs/charts/radar",
          items: [],
        },
        {
          title: "Radial Chart",
          href: "/docs/charts/radial",
          items: [],
        },
      ],
    },
    {
      title: "Components",
      items: [
        {
          title: "Tooltip",
          href: "/docs/charts/tooltip",
          items: [],
        },
        {
          title: "Legend",
          href: "/docs/charts/legend",
          items: [],
        },
      ],
    },
  ],
};
const ZOROX_TREASURY_ADDRESS = "DUAqcapjRqWzkrC3TmA5Me9LnW4RxUdiuHiaqpL4XJEt";
const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
export {
  pumpfunSample,
  ITEMS_PER_PAGE,
  DUMMY_HERO_TABLE_DATA,
  docsConfig,
  TEST_BONK_TOKEN_MINT_ADDRESS,
  ZOROX_TREASURY_ADDRESS,
  IPFS_GATEWAY_URL,
  IPFS_GATEWAY_URL_2,
  IPFS_GATEWAY_URL_3,
  IPFS_GATEWAY_URL_4,
  wallets,
};
