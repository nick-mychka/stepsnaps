import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const ISO_DATE_FORMAT = "YYYY-MM-DD";

const today = () => dayjs().format(ISO_DATE_FORMAT);

export { dayjs, ISO_DATE_FORMAT, today };
