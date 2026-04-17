import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

const ISO_DATE_FORMAT = "YYYY-MM-DD";

export { dayjs, ISO_DATE_FORMAT };
