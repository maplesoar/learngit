
import React, {Component} from 'react';
import propTypes from 'prop-types';
import dva, {connect} from 'dva';
import { Icon, Modal, List, Button} from 'antd-mobile';
import Myicon from 'components/Myicon';
import {util} from 'utils/util';

import styles from './index.less';



class Good extends React.Component {

  constructor(props) {
    super(props);
    let query = util.getRouterQuery(props);
    console.log('good query==',query)
    
    this.state = {
      query:query
    };

    window.newPromise = new Promise((resolve)=>{
      resolve()
    })
  }

  componentWillMount() {
    this.setTitleBar()
  }

  componentDidMount() {
    // 发接口
    this.getInitData();
  }

  componentWillUnmount(){
    /* 记录离开高度 */
    // let scrollRefresh = document.getElementsByClassName('scrollRefresh')[0].scrollTop
  }

  render() {
    let {userInfo,userInfoList,labelListNewEnd,isShow,morePull,
      isAdd,sureAlert,msg,inputValue,labelId} = this.props.good;
    let inputValueConvert = inputValue? inputValue.replace(/<br\/>/ig, "\n"):"";
    console.log('good render data==',userInfo)
    console.log('userInfoList==',userInfoList)
    console.log('labelListNewEnd==',labelListNewEnd)
    return(
      <div className={styles.outer} style={{height:window.winHeight - 45 + 'px'}}>
        {/*<div className={styles.top}></div>*/}
        {
          userInfo == 'init'?null:userInfo.length>0?
            <div className={styles.detail} style={{display:userInfo?'block':'none'}}>
              <div className={styles.labelList}>
                <span className={styles.left}>擅长</span>
                <div className={styles.label}>
                  {
                    labelListNewEnd.length > 0 ?
                      labelListNewEnd.map((item,index) => {
                        return(
                          <span
                            className={styles.active}
                            onClick= {(e) => {this.check(e,item,'',1)}}
                            key={index}>
                          {item}
                          </span>
                        )
                      }) :null
                  }
                  {
                    userInfoList.map((item, index) => {
                      let flag = false;   // 标识， 回显
                      for(var i=0, len=labelId.length; i<len;i++ ){
                        if(labelId[i] == item.LABLE_ID){
                          flag = true
                        }
                      }
                      return (
                        <span
                          className={flag?`${styles.active}`:''}
                          onClick= {(e) => {this.check(e,item.LABLE_NAME,item.LABLE_ID,0)}}
                          key={index}>
                          {item.LABLE_NAME}
                          </span>
                      )
                    })
                  }

                  <span onClick={this.addLabel}>+新标签</span>
                </div>
                <div className={styles.more} onClick={this.morePull}
                     style={{display:isShow?'block':'none'}}>
                  <div style={{display:!morePull?'block':'none'}}>
                    <span> 更多</span>
                    <span className={styles.arrow}></span>
                  </div>
                  <div style={{display:!morePull?'none':'block'}}>
                    <span> 收起</span>
                    <span className={styles.arrow2}></span>
                  </div>
                </div>
                <div style={{clear:'both'}}></div>
              </div>
              <div className={styles.content}>
                <span className={styles.left}>详细内容</span>
                <textarea name="" cols="47" rows="10" maxLength={500} placeholder="请输入详细擅长内容"
                          ref={(el) => this.text = el}
                          // onChange={this.changeValue}
                          autoFocus={true}>
                  {/*{inputValueConvert}*/}
                </textarea>

              </div>
              <div className={styles.send} onClick={this.saveBack}>
                保存
              </div>
            </div>:
            <span className={styles.none}>暂无数据</span>
        }
        <Modal visible={isAdd} type="alert" className='createLabel'>
          <div className='alertBtnText2'>
            <div className='modalTitle2'>
              输入标签
            </div>
            <input type="text" placeholder='标签名10个汉字以内' maxLength={10} ref='label' onBlur={this.handleChange}/>
          </div>
          <div className='alertBtnBox2'>
            <Button onClick={this.toggleAddLabel('n')} className="alertBtn2 btn-left2">否</Button>
            <Button onClick={this.toggleAddLabel('y')} className="alertBtn2 btn-right2">是</Button>
          </div>
        </Modal>

        <Modal visible={sureAlert} type="alert" className='confirm'>
          <div className='alertTitle'>
            <div className='cue'>提示</div>
            <div className='msg'>{msg}</div>
          </div>
          <div className='alertSuccessBtn'>
            <Button onClick={this.successClick} className="alertBtn2 btn-right2">确定</Button>
          </div>
        </Modal>
      </div>
    )
  }


  /* 设置导航头 */
  setTitleBar = () => {
    this.props.dispatch({
      type: 'app/setTitleBar',
      header: {
        title: "擅长维护",
        icon: <Icon type="left" size="lg" />,
        leftTap: ()=>{
          this.props.dispatch({
            type: 'good/goBack',
          });

          // this.props.history.goBack()
        }
      }
    });
  };

  getInitData = () => {
    this.props.dispatch({
      type: 'good/getInitData',
      payload: {
        reqChannel:"1",
      },
      query:this.state.query
    }).then(() => {
      // let {goodAtDesc} = this.props.home;
      console.log('desc==',this.state.query.goodAtDesc)
      this.text.value = this.state.query.goodAtDesc;
    })
  };

 
  // 多选      标签名 标签id
  check = (event,val,id,mark) => {
   console.log('enter check')
   console.log('name==',val)
   console.log('id==',id)

    //    旧标签                 新标签
    let {labelList,labelId,labelListNew} = this.props.good;

    if(event.target.className == styles.active){
      console.log('enter kong')
      event.target.className = styles.noActive;
      for(var i=0, len=labelList.length; i<len;i++){
        if(labelList[i] == val && labelId[i] == id && mark == 0){  //旧标签
          labelList.splice(i,1);
          labelId.splice(i,1)
        }
      }
      console.log('未选中的旧标签 splice后==',labelList,labelId)
      for(var j=0, len2=labelListNew.length;j<len2;j++){
        if(labelListNew[j] == val && mark == 1){  // 新标签
          labelListNew.splice(j,1);
          // console.log(labelListNew)
        }
      }
      console.log('未选中的新标签 splice后==',labelListNew)
    }else{
      console.log('enter active')
      event.target.className = styles.active;
      if(mark == 0){ // 旧标签
        labelList.push(val);
        labelId.push(id);
      }else{  // 新标签
        labelListNew.push(val)
      }
      console.log('选中的标签==',labelList,labelId,labelListNew)
    }

    this.props.dispatch({
      type: 'good/changeState',
      payload: {
        labelList:labelList,
        labelId:labelId,
        labelListNew:labelListNew
      }
    });

  };

  // 维护成功后返回上一页，将数据带过去
  saveBack = () =>{
    let {labelListNew,labelList,labelId} = this.props.good;
    console.log('++save labelListNew',labelListNew)
    console.log('labelList',labelList)
    console.log('labelId',labelId)
      // let {labelId} = this.props.good;
    let {isPubHonor,isPubTrain,nickName} = this.props.home;
      this.props.dispatch({
        type: 'good/getInsertUserInfo',
        payload: {
          "reqChannel":"1",
          "fileId":"",
          "nickName":nickName,
          "goodAtId":labelId.join(","),
          "goodAtName":labelListNew.join("@$^"),
          "goodAtDesc":this.text.value,
          "ryFlag":isPubHonor,
          "pxFlag":isPubTrain,
        },
        query:{
          labelList:labelListNew.concat(labelList),   // 选中的标签名称
        }
      })
  };

  //保存是否成功提示语弹窗 确定按钮事件
  successClick = () => {
    newPromise.then(() => {
      this.props.dispatch({
        type: 'good/changeState',
        payload: {
          sureAlert:false,
          labelListNewEnd:[],
          labelListNew:[]
        }
      });
      this.props.dispatch({
        type: 'home/changeState',
        payload: {
          resultData:"init",
        }
      });
    }).then(() => {
      // util.startToChangesHtml(this.props,'MCRM_PerInfo.html',{router:'home',empId:id});
      // 保存后返回个人信息页面
      this.props.history.push({
        pathname:'/home',
        query:{
          page:'2'
        }
      })
    })
  };

  // 更多/收起
  morePull = () => {
    newPromise.then(() => {
      this.props.dispatch({
        type: 'good/changeState',
        payload: {
          morePull:!this.props.good.morePull
        }
      });
    }).then(() => {
      let {morePull,userInfo,labelListNew} = this.props.good;
      console.log('++morePull==',morePull)
      console.log(userInfo,labelListNew)
      if(morePull){   //  展开全部数据  收起显示
        this.showLabel(userInfo,labelListNew);
      }else{                     // 默认展示10条数据  更多 显示
        let len = labelListNew.length;      // 新标签 的个数
        if(len > 10){   // 新标签 大于 10
          console.log('xin > 10')
          this.showLabel([],labelListNew.slice(0,10));
        }else if(len > 0 && len <= 10){
          console.log('xin < 10')
          let num = 10 - labelListNew.length;
          this.showLabel(userInfo.slice(0,num),labelListNew);
        }else{               // 没有新标签
          console.log('xin < 0')
          this.showLabel(userInfo.slice(0,10),[]);
        }
      }
    });
  };

  // 封装 更多/收起的展示标签
  showLabel = (O,N) => {
    console.log('++showLabel',O,N)
    this.props.dispatch({
      type: 'good/changeState',
      payload: {
        userInfoList:O,
        labelListNewEnd:N
      }
    });
  };



  // 新加新标签
  addLabel = () => {
    console.log('新建标签')
    this.props.dispatch({
      type: 'good/changeState',
      payload: {
        isAdd:true
      }
    });
  };

  // 弹出框 是否按钮
  toggleAddLabel = (val) =>{
    return () => {
      this._toggleAddLabel(val)
    }
  };
  _toggleAddLabel = (val) => {
    console.log('click 新建 val==',val)
    let only = false;   // true的时候表示重复
    if(val == 'y'){     // 是
      console.log('新建label')
      let {labelValue,userInfo,labelListNew,labelListNewEnd,labelList,morePull} = this.props.good;
      if(labelValue.length == 0){
        window.alert('输入的内容不能为空')
      } else{
        //新建的标签与旧标签 比较 去重
        labelList.map((item,index) => {
          if(item.LABLE_NAME == labelValue){
            only = true;
            window.alert('该标签名已存在');
            this.refs.label.value = '';
          }
        });

        userInfo.map((item,index) => {  //接口返回的标签与新建的标签 比较 去重
          if(item.LABLE_NAME == labelValue){
            only = true;
            window.alert('该标签名已存在');
            this.refs.label.value = '';
          }
        });

        //新建的标签与新标签 比较 去重
        labelListNew.length > 0 ?labelListNew.map((item,index) => {
          if(item == labelValue){
            only = true;
            window.alert('该标签名已存在');
            this.refs.label.value = '';
          }
        }):null;

        if(!only){   // 不重复
          console.log('不重复')
          console.log('labelValue==',labelValue)
          newPromise.then(() => {
            this.props.dispatch({
              type: 'good/changeState',
              payload: {
                labelListNew:labelListNew.concat(labelValue),
                labelListNewEnd:labelListNewEnd.concat(labelValue),
                isAdd:false,
              }
            });
          }).then(() => {
            let {labelListNew,userInfo} = this.props.good;
            this.refs.label.value = '';
            if(morePull){    // 在新旧标签全部展开的时候，显示 收起
              this.props.dispatch({
                type: 'good/changeState',
                payload: {
                  labelListNewEnd:labelListNew,
                  userInfoList:userInfo,
                }
              });
            }else{   // 默认显示10个标签
              if(userInfo.length > 10){   //  接口返回的标签数据 大于10
               console.log('新标签的个数 == ',labelListNew.length)
                let num = 10 - labelListNew.length*1;

                this.props.dispatch({
                  type: 'good/changeState',
                  payload: {
                    userInfoList:userInfo.slice(0,num)
                  }
                });
                if(labelListNew.length > 10){  // 此时新标签 大于10 ，默认只展示新标签的前10个
                  this.props.dispatch({
                    type: 'good/changeState',
                    payload: {
                      labelListNewEnd:labelListNew.slice(0,10),
                      userInfoList:[]
                    }
                  });
                }
              }else{              // 新建标签 接口返回的标签数据 小于10
                let oldLen = userInfo.length*1;
                let newLen = labelListNew.length*1;
                console.log('旧',oldLen)
                console.log('新',newLen)
                if(oldLen + newLen > 10){
                  console.log('新旧 > 10')
                  if(newLen > 10){
                    console.log('>10')
                    this.props.dispatch({
                      type: 'good/changeState',
                      payload: {
                        labelListNewEnd:labelListNew.slice(0,10),
                        userInfoList:[],
                        isShow:true,
                        morePull:false
                      }
                    });
                  }else{
                    console.log('<10')
                    this.props.dispatch({
                      type: 'good/changeState',
                      payload: {
                        labelListNewEnd:labelListNew,
                        userInfoList:userInfo.slice(0,10-newLen),
                        isShow:true,
                        morePull:false
                      }
                    });
                  }
                }else{
                  console.log('新旧 < 10')
                  this.props.dispatch({
                    type: 'good/changeState',
                    payload: {
                      labelListNewEnd:labelListNew,
                      userInfoList:userInfo,
                      isShow:false,
                    }
                  });
                }
              }
            }
            only = false;
          });
        }
      }

    }else{
      this.props.dispatch({
        type: 'good/changeState',
        payload: {
          isAdd:false
        }
      });
      this.refs.label.value = '';
    }
  };


  // 输入框
  handleChange = (e) => {
    console.log('text value==',e.target.value)
    this.props.dispatch({
      type: 'good/changeState',
      payload: {
        labelValue:e.target.value
      }
    });
  };





}

Good.propTypes = {};

export default connect((state) => state)(Good)
