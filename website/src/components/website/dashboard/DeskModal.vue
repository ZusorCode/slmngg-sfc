<template>
    <div class="break-display-modal">
        <div v-b-modal.desk>
            <b-button size="sm">
                <DashboardModalIcon/> Desk Graphics
            </b-button>
        </div>
        <b-modal ref="modal" id="desk" title="Desk Graphics">
            <b-form-radio-group class="w-100 mb-3" v-model="selectedTab" :options="['Match', 'Predictions', 'Maps']" buttons button-variant="outline-primary" />

        </b-modal>
    </div>
</template>

<script>
import DashboardModalIcon from "@/components/website/dashboard/DashboardModalIcon.vue";
import { BButton, BFormRadioGroup, BModal, VBModal } from "bootstrap-vue";

export default {
    name: "DeskModal",
    components: { BFormRadioGroup, BModal, BButton, DashboardModalIcon },
    directives: { BModal: VBModal },
    props: {
        broadcast: Object
    },
    data: () => ({
        selectedTab: "Display",
        tabs: [
            "Display",
            "Automation"
        ]
    })
};
</script>

<style scoped>

</style>
