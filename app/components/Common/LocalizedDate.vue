<script setup lang="ts">
import { dateTimeValue, parseDatePeriod, presentDateLabel, type DateValue, type LocalizedDateFormat } from "#shared/localizedDate";

const props = withDefaults(defineProps<{ value: DateValue; format?: LocalizedDateFormat; range?: boolean }>(), {
  format: "medium", range: false,
});
const { locale, rtl } = usePortfolioI18n();
const { formatDate } = useLocalizedDate();
const period = computed(() => props.range ? parseDatePeriod(String(props.value)) : undefined);
</script>

<template>
  <span v-if="range" class="localized-date" :dir="rtl ? 'rtl' : 'ltr'" :lang="locale">
    <template v-if="period">
      <time :datetime="period.start">{{ formatDate(period.start, format) }}</time>
      {{ ' – ' }}
      <time v-if="period.end" :datetime="period.end">{{ formatDate(period.end, format) }}</time>
      <span v-else>{{ presentDateLabel(locale) }}</span>
    </template>
    <template v-else>{{ value }}</template>
  </span>
  <time v-else class="localized-date" :datetime="dateTimeValue(value)" :dir="rtl ? 'rtl' : 'ltr'" :lang="locale">{{ formatDate(value, format) }}</time>
</template>

<style scoped>
.localized-date { unicode-bidi: isolate; }
</style>
