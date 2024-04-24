import { socket } from "@/socket";
import { createStore } from "vuex";
import { cleanID } from "@/utils/content-utils";
import { fetchThings } from "@/utils/fetch";

const store = createStore({
    state: {
        things: [],
        thing_map: {},
        subscribed_ids: [],
        request_buffer: [],

        highlighted_team: null,
        highlighted_match: null,
        edit_in_site_timezone: false,
        match_highlights: [],
        draft_notes: [],
        last_event_match_pages: [],
        dashboard_modules_active: [],

        data_update_buffer: [],
        website_flags: []
    },
    mutations: {
        push(_store, { id, data }) {
            data = JSON.parse(JSON.stringify({ ...data, id: cleanID(id), _original_data_id: cleanID(data.id), __stored: true }));
            // if ()

            const index = this.state.thing_map[id] || -1;
            // console.log(">update", id, this.state.things, index);
            if (index !== -1) {
                this.state.things.splice(index, 1, data);
                return this.state.things[index];
            } else {
                this.state.things.push(data);
                this.state.thing_map[id] = this.state.things.length - 1;
                return this.state.things[this.state.things.length - 1];
            }

            // this.state.things.set(id, data);
            // TODO: setup socket.io handler here for "data_UPDATE"
        },
        addToRequestBuffer(state, id) {
            state.request_buffer.push(id);
        },
        clearRequestBuffer(state) {
            state.request_buffer = state.request_buffer.slice(100);
        },
        executeRequestBuffer(state) {
            const ids = state.request_buffer.slice(0, 100);
            if (!ids.length) return;
            this.commit("clearRequestBuffer");
            return fetchThings(ids);
        },
        socketDataUpdate(state, { id, data }) {
            console.log("[store] [data_update] commit->", data);
            // this.commit("push", { id, data });
            state.data_update_buffer.push({ id, data });
        },
        executeUpdateBuffer(state) {
            if (!state.data_update_buffer.length) return;
            console.log("[store] [data_update] execute->", state.data_update_buffer.length);
            state.data_update_buffer.forEach(({ id, data }) => {
                this.commit("push", { id, data });
            });
            state.data_update_buffer = [];
        },
        subscribe(state, id) {
            if (!id) return;
            if (state.subscribed_ids.includes(id)) return;
            socket.emit("subscribe", id);
            state.subscribed_ids.push(id);
        },
        unsubscribe(state, id) {
            if (!id) return;
            if (!state.subscribed_ids.includes(id)) return;
            socket.emit("unsubscribe", id);
            state.subscribed_ids.splice(this.state.subscribed_ids.indexOf(id), 1);
        },

        setHighlightedTeam(state, teamID) {
            state.highlighted_team = teamID;
        },
        setHighlightedMatch(state, matchID) {
            state.highlighted_match = matchID;
        },
        setTimezone(state, timezone) {
            localStorage.setItem("timezone", timezone);
            state.timezone = timezone;
        },
        setUse24HourTime(state, use24HourTime) {
            localStorage.setItem("use24HourTime", use24HourTime);
            state.use24HourTime = use24HourTime;
        },
        setHighlights(state, matchHighlights) {
            state.match_highlights = matchHighlights;
        },
        setPlayerDraftNotes(state, { playerID, tag, notes }) {
            const index = state.draft_notes.findIndex(n => n.player_id === playerID);
            // console.log(playerID, tag, notes, index);
            if (index === -1) {
                return state.draft_notes.push({ player_id: playerID, tag, notes });
            }
            const data = {};
            if (tag !== undefined) data.tag = tag;
            if (notes !== undefined) data.notes = notes;
            // console.log({ ...state.draft_notes[index], ...data });
            state.draft_notes.splice(index, 1, { ...state.draft_notes[index], ...data });
        },
        setEventMatchPage(state, { eventID, matchPage }) {
            if (!eventID) return;
            if (!matchPage) return;
            const item = { eventID, matchPage };
            const index = state.last_event_match_pages.findIndex(x => x.eventID === eventID);
            if (index === -1) return state.last_event_match_pages.push(item);
            state.last_event_match_pages.splice(index, 1, item);
        },
        setDashboardModuleVisibility(state, { visible, moduleName }) {
            if (!moduleName) return;
            const index = state.dashboard_modules_active.indexOf(moduleName);

            if (index === -1) {
                // not set
                if (visible) state.dashboard_modules_active.push(moduleName);
            } else {
                // set
                if (!visible) state.last_event_match_pages.splice(index, 1);
            }
        },
        setTimeEditTimezone(state, editInSiteTimezone) {
            state.edit_in_site_timezone = editInSiteTimezone;
        },
        setWebsiteFlags(state, flags) {
            state.website_flags = flags;
        }
    },
    getters: {
        things: state => state.things,
        thing: (state) => (id) => state.things[state.thing_map[id]],
        isHighlighted: state => (id) => state.highlighted_team === id,
        getHighlight: state => (matchID) => state.match_highlights.find(match => match.id === matchID),
        getNotes: state => (playerID) => state.draft_notes.find(notes => notes.player_id === playerID),
        getLastMatchPage: state => (eventID) => state.last_event_match_pages.find(x => x.eventID === eventID),
        // highlightedMatch: (state, getters) => () => getters.thing(state.highlighted_match)
        highlightedMatch: state => () => state.highlighted_match,
        dashboardModuleIsVisible: state => (moduleName) => state.dashboard_modules_active.includes(moduleName),
        editTimeInSiteTimezone: state => state.edit_in_site_timezone,
        hasWebsiteFlag: state => flag => state.website_flags.includes(flag)
    },
    actions: {
        subscribe: (state, data) => state.commit("subscribe", data),
        unsubscribe: (state, data) => state.commit("unsubscribe", data)
    }
});


export default store;

