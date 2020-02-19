import React from 'react';
import './PlacesMarkerStyle.css';
import {Popover, notification} from 'antd';
import {FaMapMarked, FaInfoCircle} from "react-icons/fa"

class PlacesMarker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }

    visible = () => {
        if (this.state.visible === false) {
            this.setState({
                visible: true
            })
        } else {
            this.setState({
                visible: false
            })
        }
    }

    openNotification = () => {
        notification.open({
            message: <div style={{textTransform: 'lowercase', fontStretch: 'expanded', fontStyle: 'oblique'}}><FaInfoCircle style={{marginBottom: '-1.5', color: '#468AF5'}}/> {this.props.title}</div>,
            description: <div style={{textTransform: 'lowercase', fontStretch: 'expanded', fontStyle: 'oblique'}}><FaMapMarked style={{marginBottom: '-1.5', color: '#468AF5'}}/> {this.props.content}</div>,
            duration: 5
        });
    };
      
    
    render() {
        return (
            <>
                <div className='pinPlaces bouncePlaces' onClick={this.openNotification}></div>
                <div className='pulsePlaces'></div>
                <Popover
                    style={{zIndex: -1000, textTransform: 'uppercase'}}
                    content={this.props.content}
                    title={this.props.title}
                    visible={this.state.visible}
                />
            </>
        )    
    }
}

export default PlacesMarker;