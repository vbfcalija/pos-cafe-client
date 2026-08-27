import moment from 'moment'

export function useDatetimeFormatter() {
    function formatDateToReadable(time: string) {
        return moment(time).format('MMMM DD, Y');
    }

    return { formatDateToReadable }
}