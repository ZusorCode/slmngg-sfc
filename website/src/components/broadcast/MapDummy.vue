<template>
    <div class="map d-flex position-relative">
        <div class="map-bg w-100 h-100 bg-center" :style="mapBackground"></div>
        <div class="map-main d-flex flex-column h-100 w-100 position-absolute">
            <div class="map-top flex-grow-1 h-100 w-100 flex-center flex-column">
                <div class="map-logo-holder w-100 h-50 flex-center">
                    <div class="map-logo bg-center" style="background-image: url('https://cdn.discordapp.com/attachments/868228354476756992/868228369983082576/2cp.svg')"></div>
                </div>
            </div>
            <div class="map-lower flex-center flex-column" :style="accent">
                <div class="map-lower-name flex-center"><span class="industry-align">{{ mode }}</span></div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: "MapSegment",
    props: ["broadcast", "mode"],
    computed: {
        mapBackground() {
            // console.log("background", this.map.name, { submap_big: this.map?.map?.big_image, submap_image: this.map?.map?.image, parent_big: this.map?.big_image, parent_image: this.map?.image });
            // const image = this.map?.map?.big_image || this.map?.map?.image || this.map?.big_image || this.map?.image;
            // if (!(image)) return {};
            return {
                // backgroundImage: `url(${(image)[0].url}`
                backgroundImage: "url(https://cdn.discordapp.com/splashes/646065580000149514/40be7368aebcce08bc7c6eac9a1b0985.jpg?size=2048"
            };
        },
        accent() {
            if (!this.accentColor) return {};
            return {
                backgroundColor: this.accentColor.theme,
                color: this.accentColor.text_on_theme
            };
        }
    }
};
</script>

<style scoped>
    .map {
        flex-direction: column;
        margin: 0 12px;
        overflow: hidden;

        width: 0 !important;
        flex-grow: 2;
        transition: all 800ms ease;
    }
    .map-bg {
        background-size: cover;
    }
    .map-bg.grayscale {
        filter: grayscale(1);
    }
    .map-lower,
    .map-upper {
        font-size: 36px;
        text-align: center;
        padding: 10px 5px;
        line-height: 1;
        min-height: 120px;

        /* default */
        background-color: #333333;
        color: #ffffff;
    }
    .map-main {
        z-index: 2;
    }
    .map-logo {
        width: 90%;
        height: 90%;
    }
</style>
