"use strict";

const {TransactionHandler} = require("sawtooth-sdk/processor/handler");
const {InvalidTransaction} = require("sawtooth-sdk/processor/exceptions");
const {decode} = require("./services/encoding");


const FAMILY_NAME = "cryptomoji";
const FAMILY_VERSION = "0.1";
const NAMESPACE = "5f4d76";
const ALLOWED_ACTIONS = ['CREATE_COLLECTION', 'SELECT_SIRE', 'BREED_MOJI', 'CREATE_OFFER', 'CANCEL_OFFER', 'ADD_RESPONSE', 'ACCEPT_RESPONSE'];

/**
 * A Cryptomoji specific version of a Hyperledger Sawtooth Transaction Handler.
 */
class MojiHandler extends TransactionHandler {
    /**
     * The constructor for a TransactionHandler simply registers it with the
     * validator, declaring which family name, versions, and namespaces it
     * expects to handle. We"ll fill this one in for you.
     */
    constructor() {
        console.log("Initializing cryptomoji handler with namespace:", NAMESPACE);
        super(FAMILY_NAME, [FAMILY_VERSION], [NAMESPACE]);
    }

    /**
     * The apply method is where the vast majority of all the work of a
     * transaction processor happens. It will be called once for every
     * transaction, passing two objects: a transaction process request ("txn" for
     * short) and state context.
     *
     * Properties of `txn`:
     *   - txn.payload: the encoded payload sent from your client
     *   - txn.header: the decoded TransactionHeader for this transaction
     *   - txn.signature: the hex signature of the header
     *
     * Methods of `context`:
     *   - context.getState(addresses): takes an array of addresses and returns
     *     a Promise which will resolve with the requested state. The state
     *     object will have keys which are addresses, and values that are encoded
     *     state resources.
     *   - context.setState(updates): takes an update object and returns a
     *     Promise which will resolve with an array of the successfully
     *     updated addresses. The updates object should have keys which are
     *     addresses, and values which are encoded state resources.
     *   - context.deleteState(addresses): deletes the state for the passed
     *     array of state addresses. Only needed if attempting the extra credit.
     */
    apply(transaction, context) {
        let payload;
        let header;
        let signer;
        return new Promise((resolve, reject) => {
            header = transaction.header;
            signer = header.signerPublicKey;
            try {
                payload = decode(transaction.payload);
                resolve({
                    action: payload[0],
                    space: payload[1],
                    signer: signer
                });
            } catch (err) {
                let reason = new InvalidTransaction("Poorly encoded payload.");
                reject(reason);
            }
        }).then(() => {
            if (ALLOWED_ACTIONS.indexOf(payload.action) === -1) {
                throw new InvalidTransaction("Not allowed action");
            }
        });
    }
}

module.exports = MojiHandler;