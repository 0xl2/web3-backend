export const transaction = (schema: any) => {
  schema.statics.transaction = async function (cb: (tx) => Promise<unknown>): Promise<unknown> {
    const tx = await this.startSession();
    tx.startTransaction();

    try {
      const result = await cb(tx);

      await tx.commitTransaction();
      tx.endSession();

      return result;
    } catch (error) {
      tx.endSession();

      throw error;
    }
  };
};
