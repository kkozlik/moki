/*
Class to get data for all charts iin Call dashboard
*/
import React, {
    Component
} from 'react';


class ConnectivityCACharts extends Component {

    // Initialize the state
    constructor(props) {
        super(props);
        this.play = this.play.bind(this);
        this.stop = this.stop.bind(this);
        this.state = {
            data: [],
            animationTime: "",
            count: 0      
        }

    }

    /*
    Load data from elasticsearch
    get filters, types and timerange
    */
   /*
    async loadData() {
        this.setState({
            isLoading: true
        });
        var data = await elasticsearchConnection("connectivityCA/charts");

        if (typeof data === "string" && data.includes("ERROR:")) {

            this.props.showError(data);
            this.setState({
                isLoading: false
            });
            return;

        } else if (data) {

            //parse data
            //FROM TO CA
            var fromToCA = parseTopologyData.parse(data.responses[0]);

            //DURATION SUM
            var durationSum = parseAggData.parse(data.responses[1]);

            //SUM CALL-ATTEMPT
            var sumCallAttempt = parseQueryStringData.parse(data.responses[2]);

            //SUM CALL-END
            var sumCallEnd = parseQueryStringData.parse(data.responses[3]);

            //CONNECTION FAILURE RATIO CA
            var failureCA = parseHeatmapAgg.parse(data.responses[4]);

            //NUMBER OF CALL-ATTEMPS CA
            var callAtemptsCA = parseDateHeatmap.parse(data.responses[5]);

            //NUMBER OF CALL-ENDA CA
            var callEndsCA = parseDateHeatmap.parse(data.responses[6]);

            //ERROR CODE ANALYSIS
            var codeAnalysis = parseHeatmapData.parse(data.responses[7]);

            //CA RATIO HISTORY
            var ratioHistory = parseDateHeatmapAgg.parse(data.responses[8]);

            //CA AVAILABILITY
            var caAvailability = parseDateHeatmapAgg1.parse(data.responses[9]);
            
            //DURATION CA
            var durationCA = parseHeatmapDataAgg3.parse(data.responses[10]);

            //DESTINATIONS CAs STATISTICS
            var statsCA = parseMultipleData.parse(data.responses[11]);
            
            //SOURCE CAs STATISTICS
            var sourceStatsCA = parseMultipleData.parse(data.responses[12]);
            
             //NUMBER OF CALL-START CA
            var sumCallStart = parseQueryStringData.parse(data.responses[13]);

              //NUMBER OF CALL-START CA
            var ratioAnimation = parseDateHeatmapAnimation.parse(data.responses[14]);
 
            console.info(new Date() + " MOKI ConnectivityCA: finished parsing data");
            this.setState({
                fromToCA: fromToCA,
                sumCallEnd: sumCallEnd,
                sumCallAttempt: sumCallAttempt,
                durationSum: durationSum,
                failureCA: failureCA,
                callAtemptsCA: callAtemptsCA,
                callEndsCA: callEndsCA,
                codeAnalysis: codeAnalysis,
                ratioHistory: ratioHistory,
                caAvailability: caAvailability,
                durationCA: durationCA,
                statsCA: statsCA,
                sourceStatsCA: sourceStatsCA,
                sumCallStart: sumCallStart,
                ratioAnimation: ratioAnimation,
                isLoading: false

            });
        }
    }
*/
    play(){
        console.log("play");
        var data = this.state.data;
        if(ratioAnimation.length > 0){
            var i = 0;
            var thiss = this;
            console.log(ratioAnimation[i]);
            var animation = setInterval(function(){ 
                i++;
                thiss.setState({
                    data: data[i].data,
                    animationTime: ratioAnimation[i].time,
                    count: i
                }) 
                console.log(i);
                console.log(ratioAnimation[i]);
            }, 2000);

            thiss.setState({
                animation: animation
            })
            if(ratioAnimation.length === i){
                console.log("stop animation");
                clearInterval(animation);

            }
        }

    }

    stop(){
        clearInterval(this.state.animation);
        this.setState({
            data: ratioAnimation[i].data,
            animationTime: "",
            count: 0
        })
    }

    pause(){
        clearInterval(this.state.animation);
    }

    //render GUI
    render() {
        return ( <span> 
            <button onClick={this.play}>play</button><button onClick={this.stop}>stop</button>
            {this.state.animationTime ? new Date(this.state.animationTime).toLocaleString() : "" }
        </span>            
        );
    }
}

export default Animation;
