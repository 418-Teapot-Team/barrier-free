<template>
    <div class="leaflet-popup-content">
        <h3>{{ node.name }}</h3>
        <p class="type">{{ formattedType }}</p>

        <p v-if="address" class="address">{{ address }}</p>

        <!-- <p class="predicted-accessibility">{{ nodeAccessibility }}</p> -->

        <p v-if="node.wheelchair" class="wheelchair-status">
            Wheelchair accessibility: {{ node.wheelchair }}
        </p>
        <p v-if="node.wheelchair_description" class="wheelchair-description">
            {{ node.wheelchair_description }}
        </p>
        <p v-if="node.wheelchair_toilet" class="wheelchair-toilet">
            Accessible toilet: {{ node.wheelchair_toilet }}
        </p>

        <div v-if="node.website || node.phone" class="contact-info">
            <p v-if="node.website">
                <a :href="node.website" target="_blank" rel="noopener">Website</a>
            </p>
            <p v-if="node.phone">
                Phone: <a :href="`tel:${node.phone}`">{{ node.phone }}</a>
            </p>
        </div>
        <el-button @click="sayHello">More Info</el-button>
    </div>
</template>

<script setup>
import { computed } from 'vue'
// import { useCommentsStore } from '@/stores/comments'

const props = defineProps({
    node: Object,
    nodeType: String
})

// const commentsStore = useCommentsStore()
const address = computed(() => {
    return [props.node.housenumber, props.node.street, props.node.city, props.node.postcode]
        .filter(Boolean)
        .join(', ')
})

// const nodeAccessibility = computed(() =>
//     commentsStore.getAccessibility(props.node.osm_id)
// )

const formattedType = computed(() => props.nodeType.replace('_', ' '))

function sayHello() {
    window.showNodeModal(props.node)
}
</script>

<style scoped>
/* Optional styling */
.leaflet-popup-content {
    font-family: sans-serif;
}
</style>
