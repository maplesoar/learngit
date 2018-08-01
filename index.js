/*
 * @Author: 周毅
 * @Date: 2018-02-27 10:47:14
 * @Last Modified by: 周毅
 * @Last Modified time: 2018-03-01 14:27:52
 */
import react,{ Component } from 'react';
import dva, {connect} from 'dva';
import { Modal } from 'antd-mobile';


class myModal extends React.Component {

    constructor(props) {
        super(props)
        this.state={
         // visibility:false,
        }
    }

    render(){
        return(
          <Modal
            visible= {true}
            transparent
            onClose={this.props.onClose}
            title="提示"
            footer={[{ text: '确定', onPress: () => { console.log('ok'); this.props.onClose(); } }]}
          >
            {this.props.info}
          </Modal>
        )
    }

}

export default connect((state) => state)(myModal)
