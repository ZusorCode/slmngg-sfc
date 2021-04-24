import store from "../thing-store";
import { queueThings, resolveThing, resolveThings } from "@/utils/fetch";
import { cleanID } from "@/utils/content-utils";

export function ReactiveRoot (id, structure) {
    // console.log("[reactive-root]", id);
    id = cleanID(id);
    const data = store.getters.thing(id);
    if (!data) resolveThing(id);
    store.dispatch("subscribe", id);

    if (!data) return {};
    const updatedData = JSON.parse(JSON.stringify(data));

    if (structure) {
        Object.entries(structure).forEach(([key, reac]) => {
            // console.log("[reactive-root] sub-structure", key);
            if (!data[key]) return;
            updatedData[key] = reac(data);
        });
    }

    return updatedData;
}

export function ReactiveThing(key, structure) {
    // console.log("[reactive-thing] !created!", key);
    return (originalData) => {
        // console.log("[reactive-thing] !called!", key);
        let id = originalData[key];
        if (typeof id === "object" && id.length !== undefined) {
            // array
            // console.log("[reactive-thing] rebased", id);
            id = id[0];
        }
        id = cleanID(id);
        // console.log("[reactive-thing]", key, id);

        const data = store.getters.thing(id);
        if (!data) resolveThing(id);
        store.dispatch("subscribe", id);
        // console.log("[reactive-thing] data", data);
        if (!data) return {};

        const updatedData = JSON.parse(JSON.stringify(data));
        if (structure) {
            Object.entries(structure).forEach(([key, reac]) => {
                // console.log("[reactive-array-thing] sub-structure", key);
                if (!data[key]) return;
                updatedData[key] = reac(data);
            });
        }
        return updatedData;

        // return data;
    };
}

export function ReactiveArray (key, structure) {
    // console.log("[reactive-array] !created!", key);
    let oldIDs = [];

    return (originalData) => {
        let data = originalData[key];
        const newIDs = [];

        const idsToResolve = [];

        data = data.map(id => {
            id = cleanID(id);
            if (!id) return {};
            const d = store.getters.thing(id);
            if (!d) idsToResolve.push(id);
            newIDs.push(id);
            store.dispatch("subscribe", id);
            if (!d) return {};

            const updatedData = JSON.parse(JSON.stringify(d));
            if (structure) {
                Object.entries(structure).forEach(([key, reac]) => {
                    // console.log("[reactive-array-thing] sub-structure", key);
                    if (!d[key]) return;
                    updatedData[key] = reac(d);
                });
            }
            return updatedData;
        });

        // console.log(idsToResolve, idsToResolve.length);

        queueThings(idsToResolve);

        // unsubscriptions
        // oldIDs.forEach(id => { if (!newIDs.includes(id)) { store.dispatch("unsubscribe", id); } });
        oldIDs = newIDs;
        return data;
    };
}

/**
 * @param {Array<string>} ids - Array of Airtable IDs to load in one call
 */
export function ReactiveCacheArray(ids) {
    // Used to preload data in single requests when you know it'll be loaded further down the line
    console.log("[reactive-cache]", ids.length);
    const idsToResolve = [];
    ids.map(id => {
        id = cleanID(id);
        const data = store.getters.thing(id);
        if (!data) idsToResolve.push(id);
    });
    return queueThings(idsToResolve);
}
