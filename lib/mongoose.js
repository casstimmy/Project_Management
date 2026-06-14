import mongoose from "mongoose";

let connectionPromise = null;

export function mongooseConnect() {
    // Already connected
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    }

    // Currently connecting — wait for the existing attempt
    if (mongoose.connection.readyState === 2) {
        return mongoose.connection.asPromise();
    }

    // Not connected — initiate connection (singleton promise to prevent parallel connects)
    if (!connectionPromise) {
        const uri = process.env.MONGODB_URI;
        connectionPromise = mongoose.connect(uri).then((m) => {
            connectionPromise = null;
            return m;
        }).catch((err) => {
            connectionPromise = null;
            throw err;
        });
    }

    return connectionPromise;
}