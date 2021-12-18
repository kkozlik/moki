import React, {
    Component
} from 'react';

class LoadingScreenCharts extends Component {
    render() {
        return (
            <div className="row align-items-center justify-content-center overlay" style={{ left: 0 }}>
                <div className="loaderr">
                    <div className="bar"></div>
                </div>
                <div style={{"position": "absolute", "marginBottom": "30px"}}><h2 style={{ "marginLeft": "10px", "fontSize": "medium", "color": " var(--main)" }} >LOADING DATA</h2></div>
            </div>
        )
    }
}

export default LoadingScreenCharts;