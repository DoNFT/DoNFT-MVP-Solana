<template>
  <div class="navbar">
    <nav class="navbar__nav">
      <div
        class="navbar__nav-wrap"
        v-for="(item, key) in navigation"
        :key="key"
      >
        <button
          :class="['main-btn navbar__nav-wrap__item', {
            'navbar__nav-wrap__item--disabled': item.params && !item.params.id ? true : false
          }]"
          @click="nadleRedirect(item)"
        >
          <span>{{ item.text }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { useRouter } from "vue-router";

defineProps({
  navigation: {
    type: Array,
    default: () => [],
  },
});
const router = useRouter();

const nadleRedirect = (item) => {
  router.push({ name: item.name, params: item.params ? item.params : {} });
};
</script>

<style lang="scss">
.navbar {
	width: 20%;
  margin-right: 30px;
}
.navbar__nav {
  display: flex;
  flex-direction: column;
}

.navbar__nav-wrap {
  margin-bottom: 15px;
}

.navbar__nav-wrap__item {
  position: relative;
  font-family: 'Roboto mono';
  display: block;
  padding: 5px 10px;
  max-width: 250px;
  font-size: 24px;
  font-weight: 500;
  min-width: 215px;
  text-align: center;
  background-color: #5ce9bc;
  border: #000 2px solid;
  line-height: 1;
  overflow: hidden;
  transition: background-color 0.15s ease;

  span {
    position: relative;
    z-index: 10;
    color: #000;
  }

  &:before {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    content: '';
    width: 100%;
    height: 100%;
    background: #2d0949;
    transform: translateX(-235px);
    z-index: 1;
    transition: transform 0.25s ease;
  }
}

.navbar__nav-wrap__item--disabled {
		box-shadow: none;
		background-color: rgba(58, 31, 79, .4);
    pointer-events: none;
    span {
      color: #00000047;
    }

		&:hover {
			background-color: rgba(58, 31, 79, .4);
			color: #00000047;
	
			span {
				color: #00000047;
			}
      &.navbar__nav-wrap__item:before {
        transform: translateX(-235px);
      }
		}

}

.navbar__nav-wrap__item:hover,
.navbar__nav-wrap__item:focus {

  span {
    color: #fff;
  }
  &:before {
    transform: translateX(0);
  }
}

</style>