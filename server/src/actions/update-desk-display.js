const { getBroadcast } = require("../action-utils/action-utils");

module.exports = {
    key: "update-desk-display",
    auth: ["client"],
    requiredParams: ["option"],
    /***
     * @param {string} option
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ option }, { client }) {

        const broadcast = await getBroadcast(client);

        let validOptions = [
            "Match",
            "Notice (Team 1)",
            "Notice (Team 2)",
            "Notice (Event)",
            "Predictions",
            "Maps"
        ];

        if (!validOptions.includes(option) && option !== null) {
            throw "Invalid option provided";
        }

        let response = await this.helpers.updateRecord("Broadcasts", broadcast,{
            "Desk Display": option
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};
