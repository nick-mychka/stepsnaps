import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const ISO_DATE_FORMAT = "YYYY-MM-DD";

const today = () => dayjs().format(ISO_DATE_FORMAT);

const yesterday = () => dayjs().subtract(1, "day").format(ISO_DATE_FORMAT);

export { dayjs, ISO_DATE_FORMAT, today, yesterday };
