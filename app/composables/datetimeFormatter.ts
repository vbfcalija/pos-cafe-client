import moment from 'moment'

export function useDatetimeFormatter() {
    function formatDateToReadable(time: string) {
        return moment(time).format('MMMM DD, Y')
    }

    function formatDatetimeToReadable(time: string) {
        return moment(time).format('MMMM DD, Y h:mm A')
    }

    return { formatDateToReadable, formatDatetimeToReadable }
}
