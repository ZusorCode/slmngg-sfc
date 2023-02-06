const { getBroadcast } = require("../action-utils/action-utils");

module.exports = {
    key: "update-desk-graphics-display",
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
            "Follow Desk Display",
            "Sponsors",
            "Event Logo",
            "Match",
            "Teams"
        ];

        if (!validOptions.includes(option) && option !== null) {
            throw "Invalid option provided";
        }

        let response = await this.helpers.updateRecord("Broadcasts", broadcast,{
            "Desk Graphics Display": option
        });

        if (response?.error) {
            console.error("Airtable error", response.error);
            throw "Airtable error";
        }
    }
};
