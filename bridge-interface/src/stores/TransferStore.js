import { observable, action } from "mobx";

import { axiosInstance } from "@/api/axios-instance";

export class TransferStore {
  @observable
  transferRequest = undefined;

  @observable
  transferId = undefined;

  @observable
  isCompleted = false;

  // https://archive.ph/t5Wym
  @observable
  transactionMap = new Map([
    [
      "bridge:fee",
      {
        isCompleted: false,
        transaction: null,
        receipt: null,
        isProcessing: false,
        createdAt: null,
        completedAt: null,
      },
    ],
    [
      "bridge:source:approval",
      {
        isCompleted: false,
        transaction: null,
        isProcessing: false,
        completedAt: null,
      },
    ],
    [
      "bridge:source",
      {
        isCompleted: false,
        transaction: null,
        isProcessing: false,
        allowance: null,
        createdAt: null,
        completedAt: null,
        receipt: null,
      },
    ],
    [
      "bridge:destination",
      {
        isCompleted: false,
        transaction: null,
        isProcessing: false,
        createdAt: null,
        completedAt: null,
      },
    ],
  ]);

  @observable
  transferDialogOpen = false;

  @observable
  intervalTransactions = undefined;

  @action
  setTransactionForKey = async (key, transaction) => {
    const record = this.transactionMap.get(key);

    console.log(`[${key}:processing]  ${transaction.hash}`);
    this.transactionMap.set(key, {
      ...record,
      transaction,
      isProcessing: true,
    });

    const receipt = await transaction.wait(3);

    console.log(`[${key}:confirmed]  ${transaction.hash}`);

    this.transactionMap.set(key, {
      ...record,
      isProcessing: false,
      receipt,
      completedAt: new Date(),
    });

    this.isCompleted = true
  };

  @action
  completeTransfer = async (transferId, transaction) => {
    // --- set transfer id
    this.transferId = transferId;

    const key = "bridge:destination";
    const record = this.transactionMap.get(key);

    // Flag as processing
    this.transactionMap.set(key, {
      ...record,
      transaction,
      isProcessing: true,
    });

    // --- wait for completion
    const receipt = await transaction.wait(3);
  
    this.transactionMap.set(key, {
      ...record,
      isProcessing: false,
      receipt,
      completedAt: new Date(),
    });

    // --- TODO: flag as completed
  };

  @action
  resolveCurrentStep = () => {
    switch (true) {
      case !this.transactionMap.get("bridge:fee").completedAt:
        return "bridge:fee";
      case this.transactionMap.get("bridge:fee").completedAt &&
        !this.transactionMap.get("bridge:source:approval").completedAt:
        return "bridge:source:approval";
      case this.transactionMap.get("bridge:fee").completedAt &&
        this.transactionMap.get("bridge:source:approval").completedAt &&
        !this.transactionMap.get("bridge:source").completedAt:
        return "bridge:source";
      case this.transactionMap.get("bridge:fee").completedAt &&
        this.transactionMap.get("bridge:source:approval").completedAt &&
        this.transactionMap.get("bridge:source").completedAt &&
        !this.transactionMap.get("bridge:destination").completedAt:
        return "bridge:destination";
      case this.isCompleted:
        return "completed";
      default:
        throw new Error("Unable to resolve currentStep()");
    }
  };

  @action
  submitTransfer = async (transferRequest, txnHash) => {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post(
          "/transfers/submit",
          {
            sourceTxnHash: txnHash,
            fromNetwork: transferRequest.from,
            toNetwork: transferRequest.to,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "JWT API_KEY_FOR_BRIDGE",
            },
          }
        )
        .then(
          ({ data }) => {
            resolve({
              transferId: data._id,
              destTransactionHash: data.destTransactionHash,
            });
          },
          (err) => {
            console.log(err);
            reject("Error submitting transfer");
          }
        );
    });
  };

  /**
   * Set the payload information
   */
  @action
  initializeTransfer = (payload) => {
    this.transferRequest = payload;
    this.transferDialogOpen = true;
  };

  @action
  setTransferDialogOpen = (transferDialogOpen) => {
    this.transferDialogOpen = transferDialogOpen;
  };

  @action
  setTransferId = (transferId) => {
    this.transferId = transferId;
  };

  @action
  resetTransactions = () => {
    this.transferForm = {};
    clearInterval(this.intervalTransactions);
    this.transactions = null;
  };
}
