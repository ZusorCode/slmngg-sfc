const Cache = require("../cache");
const { getAll,
    dirtyID
} = require("./action-utils");
/**
 *
 * @param {UserData} user
 * @param match
 * @param event
 * @returns {Promise<boolean>}
 */
async function canEditMatch(user, { match, event }) {
    if ((user.airtable?.website_settings || []).includes("Can edit any match")) return true;

    if (match) {
        console.log("match, setting event", match.event?.[0]);
        event = match.event?.[0];
    }

    if (event) {
        if (typeof event === "string") {
            event = await Cache.get(event);
        }

        // check event perms
        // event.staff have access to edit matches
        if ((event.staff || []).includes(user.airtable.id)) return true;
    }

    // player.player_relationships with event OR
    // player.player_relationships with match
    // and the relationship has "Match Editor" permission
    // have access

    let playerRelationships = await getAll(user.airtable.player_relationships || []);

    if (match) {
        let matchPlayerRelationships = playerRelationships.filter(rel =>
            (rel.permissions || []).includes("Match Editor") &&
            (rel.matches || []).some(matchID => matchID === dirtyID(match.id))
        );
        if (matchPlayerRelationships.length !== 0) return true;
    }

    let eventPlayerRelationships = playerRelationships.filter(rel =>
        (rel.permissions || []).includes("Match Editor") &&
        (rel.events || []).some(eventID => eventID === dirtyID(event.id))
    );
    if (eventPlayerRelationships.length !== 0) return true;

    return false;
}

module.exports = {
    canEditMatch
};
