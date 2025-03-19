export type NetworkType =
  | "kaspa_mainnet"
  | "kaspa_testnet_11"
  | "kaspa_testnet_10"
  | "kaspa_devnet";

export interface KRC20OrderParams {
  krc20Tick: string;
  krc20Amount: number;
  kasAmount: number;
  psktExtraOutput?: Record<string, unknown>;
  priorityFee?: number;
}

export interface CancelKRC20OrderParams {
  krc20Tick: string;
  txJsonString: string;
  sendCommitTxId: string;
}

export interface BuyKRC20TokenParams {
  txJsonString: string;
  extraOutput: Record<string, unknown>;
  priorityFee?: number;
}

export interface Output {
  address: string;
  amount: number;
}

export interface CommitRevealParams {
  priorityEntries?: string[];
  entries: string[];
  outputs: Output[];
  changeAddress: string;
  priorityFee?: number;
  networkId: string;
  script: string;
}

export interface SendKaspaParams {
  priorityFee?: number;
  payload?: Record<string, unknown>;
}

export interface KRC20BatchTransferItem {
  address: string;
  amount: number;
  tick: string;
}

export interface Balance {
  confirmed: string;
  unconfirmed: string;
  total: string;
}

export interface UtxoEntry {
  address: string;
  amount: number;
  scriptPublicKey: string;
  transactionId: string;
  index: number;
}

export interface KaspaWallet {
  /** Request user permission to access their Kaspa wallet */
  requestAccounts(): Promise<void>;

  /** Get the current network the wallet is connected to */
  getNetwork(): Promise<NetworkType>;

  /** Switch the wallet to a different network
   * @param network - The network to switch to
   */
  switchNetwork(network: NetworkType): Promise<void>;

  /** Get the list of accounts/addresses in the wallet */
  getAccounts(): Promise<string[]>;

  /** Get the public key of the current account */
  getPublicKey(): Promise<string>;

  /** Get the balance of the current account */
  getBalance(): Promise<Balance>;

  /** Get KRC20 token balances for the current account */
  getKRC20Balance(): Promise<Record<string, string>>;

  /** Get UTXO entries for a given address
   * @param address - The address to get UTXOs for
   */
  getUtxoEntries(address: string): Promise<UtxoEntry[]>;

  /** Get P2SH address from inscription JSON
   * @param inscribeJsonString - JSON string of the inscription
   */
  getP2shAddress(inscribeJsonString: string): Promise<string>;

  /** Create a KRC20 order
   * @param params - Parameters for creating the order
   */
  createKRC20Order(params: KRC20OrderParams): Promise<string>;

  /** Cancel a KRC20 order
   * @param params - Parameters for canceling the order
   */
  cancelKRC20Order(params: CancelKRC20OrderParams): Promise<string>;

  /** Sign a cancel KRC20 order transaction
   * @param params - Parameters for signing the cancel order
   */
  signCancelKRC20Order(params: CancelKRC20OrderParams): Promise<string>;

  /** Buy KRC20 tokens
   * @param params - Parameters for buying tokens
   */
  buyKRC20Token(params: BuyKRC20TokenParams): Promise<string>;

  /** Sign a buy KRC20 token transaction
   * @param params - Parameters for signing the buy transaction
   */
  signBuyKRC20Token(params: BuyKRC20TokenParams): Promise<string>;

  /** Submit a commit transaction
   * @param params - Parameters for the commit transaction
   */
  submitCommit(params: CommitRevealParams): Promise<string>;

  /** Submit a reveal transaction
   * @param params - Parameters for the reveal transaction
   */
  submitReveal(params: CommitRevealParams): Promise<string>;

  /** Submit both commit and reveal transactions
   * @param commit - Commit transaction data
   * @param reveal - Reveal transaction data
   * @param script - Script to execute
   * @param networkId - Network ID
   */
  submitCommitReveal(
    commit: CommitRevealParams,
    reveal: CommitRevealParams,
    script: string,
    networkId: string,
  ): Promise<string>;

  /** Sign a message
   * @param text - Message to sign
   * @param noAuxRand - Whether to use auxiliary randomness
   * @param type - Type of signature
   */
  signMessage(
    text: string,
    noAuxRand?: boolean,
    type?: string,
  ): Promise<string>;

  /** Verify a signed message
   * @param pubkey - Public key that signed the message
   * @param message - Original message
   * @param sig - Signature to verify
   */
  verifyMessage(pubkey: string, message: string, sig: string): Promise<boolean>;

  /** Send Kaspa to an address
   * @param toAddress - Recipient address
   * @param sompi - Amount in sompi
   * @param params - Additional parameters
   */
  sendKaspa(
    toAddress: string,
    sompi: number,
    params?: SendKaspaParams,
  ): Promise<string>;

  /** Sign a KRC20 transaction
   * @param inscribeJsonString - JSON string of the inscription
   * @param type - Transaction type
   * @param destAddr - Destination address
   * @param priorityFee - Priority fee
   */
  signKRC20Transaction(
    inscribeJsonString: string,
    type: string,
    destAddr: string,
    priorityFee?: number,
  ): Promise<string>;

  /** Batch transfer KRC20 tokens
   * @param list - List of transfers to make
   * @param priorityFee - Priority fee
   */
  krc20BatchTransferTransaction(
    list: KRC20BatchTransferItem[],
    priorityFee?: number,
  ): Promise<string>;

  /** Cancel a KRC20 batch transfer */
  cancelKRC20BatchTransfer(): Promise<void>;

  /** Push a raw transaction
   * @param rawtx - Raw transaction hex
   */
  pushTx(rawtx: string): Promise<string>;

  /** Disconnect from a specific origin
   * @param origin - Origin to disconnect from
   */
  disconnect(origin: string): Promise<void>;

  /** Get wallet version */
  getVersion(): Promise<string>;

  /** Set maximum number of event listeners
   * @param n - Number of listeners
   */
  setMaxListeners(n: number): void;

  /** Initialize the wallet */
  initialize(): void;
}
