import { Contract, providers, Wallet, utils,BigNumber} from "ethers";
import { UNISWAP_PAIR_ABI, UNISWAP_QUERY_ABI,UNI, FACTORY_UNI } from "./ABI";


const provider = new providers.JsonRpcProvider(process.env.ALCHEMY_URL);

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
const my_address = ""
const uniswapFactoryContractAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

const uniswapFactoryContract = new Contract(
  uniswapFactoryContractAddress,
  FACTORY_UNI.abi, provider,
);

//check pair price 
//https://v2.info.uniswap.org/pair/0x3041cbd36888becc7bbcbc0045e3b1f144466f5f

const pair = await uniswapFactoryContract.getPair(USDC, USDT)
const uniswapstablecoins = new Contract(
  pair,
  UNISWAP_PAIR_ABI, provider,
);


//function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
const stables = await uniswapstablecoins.getReserves();

const reserve0 = Number(utils.formatUnits(stables[0], 6));
const reserve1 = Number(utils.formatUnits(stables[1], 6));


const priceOfUsdt = reserve0 / reserve1;
const priceOfUsdc = reserve1 / reserve0;

console.log(priceOfUsdt, 'usdt');
console.log(priceOfUsdc, 'usdc');

const gasPrice = await provider.getGasPrice()

const amtInGwei = utils.formatUnits(gasPrice, "gwei")
console.log(amtInGwei, "amtInGwei")

//function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
// for flash swap
// bytes: data.length is greater than 0, the contract transfers the tokens and then calls the following function on the to address:

const txs = async () => {
  console.log('checking..')
  if (priceOfUsdt <= 0.5){
    const bytes = ethers.utils.toUtf8Bytes('2')
    const amount0Out_ = 500
    const amount1Out_ = 250
    const amount0Out = utils.parseEther(amount0Out_.toString());
    const amount1Out = utils.parseEther(amount1Out_.toString());
      uniswapstablecoins.swap(
      amount0Out,
      amount1Out,
      my_address, 
      bytes
  
    )
     
  }else{
    console.log('no arb available..')
  }
 
};

await txs();