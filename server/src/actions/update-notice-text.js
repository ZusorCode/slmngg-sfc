const { getBroadcast } = require("../action-utils/action-utils");

module.exports = {
    key: "update-notice-text",
    auth: ["client"],
    requiredParams: ["notice"],
    /***
     * @param {string} notice
     * @param {ClientData} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line no-empty-pattern
    async handler({ notice }, { client }) {

        const broadcast = await getBroadcast(client);

        let response = await this.helpers.updateRecord("Broadcasts", broadcast,{
            "Notice Text": notice
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};
