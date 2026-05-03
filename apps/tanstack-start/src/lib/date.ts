import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const ISO_DATE_FORMAT = "YYYY-MM-DD";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const today = () => dayjs().format(ISO_DATE_FORMAT);

const yesterday = () => dayjs().subtract(1, "day").format(ISO_DATE_FORMAT);

export { dayjs, ISO_DATE_FORMAT, ISO_DATE_REGEX, today, yesterday };
