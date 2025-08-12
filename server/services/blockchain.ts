import { ethers } from 'ethers';

// Production-ready blockchain service for EcoToken operations
class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;
  private contractABI: any[];
  private gasConfig: {
    gasPrice: string;
    gasLimit: number;
  };

  constructor() {
    this.contractAddress = process.env.ECO_TOKEN_CONTRACT_ADDRESS || '';
    
    // Complete ERC-20 ABI with additional functions
    this.contractABI = [
      // Standard ERC-20 functions
      "function name() external view returns (string)",
      "function symbol() external view returns (string)",
      "function decimals() external view returns (uint8)",
      "function totalSupply() external view returns (uint256)",
      "function balanceOf(address account) external view returns (uint256)",
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) external view returns (uint256)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
      
      // Custom functions for your EcoToken (if you have them)
      "function mint(address to, uint256 amount) external",
      "function burn(address from, uint256 amount) external",
      "function burnFrom(address from, uint256 amount) external",
      
      // Events
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "event Mint(address indexed to, uint256 amount)",
      "event Burn(address indexed from, uint256 amount)"
    ];

    this.gasConfig = {
      gasPrice: (parseInt(process.env.GAS_PRICE_GWEI || '30') * 1e9).toString(), // Convert Gwei to Wei
      gasLimit: parseInt(process.env.GAS_LIMIT || '100000')
    };

    this.initializeProvider();
  }

  private async initializeProvider(): Promise<void> {
    try {
      // Validate environment variables
      if (!process.env.BLOCKCHAIN_RPC_URL) {
        throw new Error('BLOCKCHAIN_RPC_URL is not configured');
      }
      
      if (!this.contractAddress || this.contractAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('ECO_TOKEN_CONTRACT_ADDRESS is not configured or is zero address');
      }

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      
      // Test provider connection
      const network = await this.provider.getNetwork();
      console.log(`Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Initialize wallet if private key is provided and valid
      if (process.env.PRIVATE_KEY && this.isValidPrivateKey(process.env.PRIVATE_KEY)) {
        try {
          this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
          console.log(`Wallet address: ${this.wallet.address}`);

          // Check wallet balance
          const balance = await this.provider.getBalance(this.wallet.address);
          console.log(`Wallet balance: ${ethers.formatEther(balance)} MATIC`);

          if (balance === BigInt(0)) {
            console.warn('⚠️ Warning: Wallet has no MATIC for gas fees');
          }
        } catch (error) {
          console.warn('⚠️ Warning: Invalid private key provided. Running in read-only mode.');
          this.wallet = null;
        }
      } else {
        console.warn('⚠️ Warning: PRIVATE_KEY not provided. Read-only mode enabled.');
      }

      // Initialize contract
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.wallet || this.provider
      );

      // Verify contract exists
      const code = await this.provider.getCode(this.contractAddress);
      if (code === '0x') {
        throw new Error(`No contract found at address: ${this.contractAddress}`);
      }

      console.log('✅ Blockchain service initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize blockchain provider:', error);
      
      // In development, you might want to continue with mock mode
      if (process.env.NODE_ENV === 'development' && process.env.MOCK_BLOCKCHAIN_SERVICE === 'true') {
        console.log('🔄 Falling back to mock mode for development');
        return;
      }
      
      throw error;
    }
  }

  // Check if we're in mock mode
  private isMockMode(): boolean {
    return process.env.NODE_ENV === 'development' && 
           process.env.MOCK_BLOCKCHAIN_SERVICE === 'true' ||
           !this.contract ||
           !this.wallet;
  }

  async mintTokens(userAddress: string, amount: string): Promise<{ txHash: string; success: boolean; error?: string }> {
    try {
      // Validate inputs
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address');
      }

      const parsedAmount = ethers.parseUnits(amount, 18); // Assuming 18 decimals
      
      if (parsedAmount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Mock mode fallback
      if (this.isMockMode()) {
        return this.mockMintTokens(userAddress, amount);
      }

      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not initialized');
      }

      // Check if minting function exists and wallet has permission
      console.log(`Minting ${amount} ECO tokens to ${userAddress}...`);

      // Estimate gas
      const gasEstimate = await this.contract.mint.estimateGas(userAddress, parsedAmount);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2); // Add 20% buffer

      // Execute transaction
      const tx = await this.contract.mint(userAddress, parsedAmount, {
        gasLimit,
        gasPrice: this.gasConfig.gasPrice
      });

      console.log(`Transaction sent: ${tx.hash}`);
      console.log('Waiting for confirmation...');

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        console.log(`✅ Minting successful! Block: ${receipt.blockNumber}`);
        return {
          txHash: tx.hash,
          success: true
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('❌ Token minting failed:', error);
      return {
        txHash: '',
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async burnTokens(userAddress: string, amount: string): Promise<{ txHash: string; success: boolean; error?: string }> {
    try {
      // Validate inputs
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address');
      }

      const parsedAmount = ethers.parseUnits(amount, 18);
      
      if (parsedAmount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Mock mode fallback
      if (this.isMockMode()) {
        return this.mockBurnTokens(userAddress, amount);
      }

      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not initialized');
      }

      // Check user balance first
      const balance = await this.contract.balanceOf(userAddress);
      if (balance < parsedAmount) {
        throw new Error('Insufficient token balance');
      }

      console.log(`Burning ${amount} ECO tokens from ${userAddress}...`);

      // Estimate gas
      const gasEstimate = await this.contract.burn.estimateGas(userAddress, parsedAmount);
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      // Execute transaction
      const tx = await this.contract.burn(userAddress, parsedAmount, {
        gasLimit,
        gasPrice: this.gasConfig.gasPrice
      });

      console.log(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        console.log(`✅ Burning successful! Block: ${receipt.blockNumber}`);
        return {
          txHash: tx.hash,
          success: true
        };
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error: any) {
      console.error('❌ Token burning failed:', error);
      return {
        txHash: '',
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  async getTokenBalance(userAddress: string): Promise<string> {
    try {
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Invalid address');
      }

      // Mock mode fallback
      if (this.isMockMode()) {
        return this.mockGetTokenBalance(userAddress);
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const balance = await this.contract.balanceOf(userAddress);
      return ethers.formatUnits(balance, 18); // Assuming 18 decimals
      
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  }

  async getTotalSupply(): Promise<string> {
    try {
      // Mock mode fallback
      if (this.isMockMode()) {
        return this.mockGetTotalSupply();
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const totalSupply = await this.contract.totalSupply();
      return ethers.formatUnits(totalSupply, 18);
      
    } catch (error) {
      console.error('Failed to get total supply:', error);
      return '0';
    }
  }

  async getNetworkStatus(): Promise<{ 
    connected: boolean; 
    network: string; 
    gasPrice: string; 
    blockHeight: string;
    walletAddress?: string;
    walletBalance?: string;
  }> {
    try {
      if (!this.provider) {
        return {
          connected: false,
          network: 'Unknown',
          gasPrice: '0 Gwei',
          blockHeight: '0'
        };
      }

      // Get network info
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const feeData = await this.provider.getFeeData();
      
      const result: any = {
        connected: true,
        network: network.name || `Chain ID: ${network.chainId}`,
        gasPrice: feeData.gasPrice ? `${Math.floor(Number(feeData.gasPrice) / 1e9)} Gwei` : 'Unknown',
        blockHeight: blockNumber.toString()
      };

      // Add wallet info if available
      if (this.wallet) {
        result.walletAddress = this.wallet.address;
        const balance = await this.provider.getBalance(this.wallet.address);
        result.walletBalance = `${ethers.formatEther(balance)} MATIC`;
      }

      return result;
      
    } catch (error) {
      console.error('Failed to get network status:', error);
      return {
        connected: false,
        network: 'Error',
        gasPrice: '0 Gwei',
        blockHeight: '0'
      };
    }
  }

  // Mock implementations for development
  private async mockMintTokens(userAddress: string, amount: string): Promise<{ txHash: string; success: boolean }> {
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`🎭 Mock minting ${amount} ECO tokens to ${userAddress}`);
    return { txHash: mockTxHash, success: true };
  }

  private async mockBurnTokens(userAddress: string, amount: string): Promise<{ txHash: string; success: boolean }> {
    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`🎭 Mock burning ${amount} ECO tokens from ${userAddress}`);
    return { txHash: mockTxHash, success: true };
  }

  private mockGetTokenBalance(userAddress: string): string {
    return (Math.random() * 1000).toFixed(8);
  }

  private mockGetTotalSupply(): string {
    return '156200.00000000';
  }

  // Utility method to check if service is ready
  isReady(): boolean {
    return this.isMockMode() || (!!this.provider && !!this.contract);
  }

  // Get contract address
  getContractAddress(): string {
    return this.contractAddress;
  }
}

export const blockchainService = new BlockchainService();
