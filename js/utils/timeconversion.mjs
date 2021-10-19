export class TimeConversion {
    static secondsToTime(seconds){
        // let hr  = Math.floor(seconds / 3600);
        let sec = Math.floor(seconds);
        sec = Math.floor( sec % 60 );
        sec = sec >= 10 ? sec : '0' + sec;

        let min = Math.floor(seconds / 60);
        min = min >= 10 ? min : '0' + min;

        return min + ":" + sec;
    }
}