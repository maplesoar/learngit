import React, {Component} from 'react';
import PropTypes from 'prop-types';
import dva, {connect} from 'dva';
import { Icon, Tabs, List,PullToRefresh ,Modal} from 'antd-mobile';
import ReactEcharts from 'echarts-for-react';
import Myicon from 'components/Myicon';
import MyUtil from '../../../util';
import {util} from 'utils/util'
import DownMenu from 'components/DownMenu';
import MfTLoader from 'components/MfTLoader';
import tishi from 'public/img/remind/tishi.png';


import ReactTable from 'rc-table'
import 'rc-table/assets/index.css'

import styles from './index.less'



class DepChange extends React.Component {

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props)
    this.query = props.query;
    this.queryDetail = props.queryDetail;
    this.state={
      showDetail: false, //默认关闭资金流向弹出框
      showNoDataDetail:false,//默认关闭资金明细暂无数据弹出框
      selectCustName:"",
      seeMore:false,   //弹窗查看更多
      CUST_ID:"",
      ifSession:true
    }
  }

  componentWillMount() {
    this.setTitleBar()
  }

  componentDidMount() {
    /* 存默认机构 && 调日期接口 && 存默认日期  */
    this.props.depChange.bal?this.restore():
    this.props.dispatch({
      type: MyUtil.isMa(this.queryDetail.menuId)?'depChange/getMenusInfoMa':'depChange/getMenusInfo',
      payload: {
        org: this.query.orgName != undefined ? ((this.query.orgName == "总行" )? "全行" : this.query.orgName ):(this.queryDetail.user.orgName == "总行") ? "全行" : this.queryDetail.user.orgName,
        orgId: this.query.orgName != undefined ? this.query.orgId : this.queryDetail.user.orgId,
        type: MyUtil.isMa(this.queryDetail.menuId) ? "4" : "3",
        date:this.queryDetail.date,
        tabType:"0",
      }
    }).then(()=>{
      this.getInitData("2")
    })
  }

  componentWillUnmount(){

  }


  render(){
    let {bal,unit,tableValue,tableDetail,noMore,menus,org,date,orgId,order} = this.props.depChange
    /* table th */
    let columns = [
      {
        title: "客户名称",
        key: "CUST_NAME",
        dataIndex: "CUST_NAME",
        width: 80,
        fixed: 'left',
        onCellClick : (e)=>{
          /* 记录离开高度 */
          let scrollRefresh = this.refs.depChange.refs.panel.scrollTop;
          util.ssSet("depChangeTop","scroll",scrollRefresh)
          util.startToChangesHtml(this.props, 'MCRM_CustView.html',
            {custName: e.CUST_NAME, custNo: e.CUST_ID, router: '/custPanoramicView'})
        },
        render: (o, row, index) => {
          return <div style={{width:'110px'}} className={styles.custName}>{row.CUST_NAME}</div>
        }
      },{
        title: <div onClick={this.onSort("1")}>{((order == "1") ||(order == "0") )?((order == "1") ?"本日累计变动↑":"本日累计变动↓") : "本日累计变动"}</div>,
        dataIndex: 'BSR',
        key: 'BSR',
        render: (o, row, index) => {
          return <div>{MyUtil.formatMoney(row.BSR)}</div>
        },
        onCellClick : (e)=>{
          // this.setState({
          //   CUST_ID:e.CUST_ID,
          //   selectCustName: e.CUST_NAME,
          // },()=>{
          //   this.getInitData("1")
          // })
        }
      },{
        title: <div onClick={this.onSort("8")}>{(order == "8") ?"本日资金流入↓":"本日资金流入"}</div>,
        dataIndex: 'BRLR',
        key: 'BRLR',
        render: (o, row, index) => {
          return <div>{MyUtil.formatMoney(row.BRLR)}</div>
        },
      },{
        title: <div onClick={this.onSort("9")}>{order == "9" ?"本日资金流出↓":"本日资金流出"}</div>,
        dataIndex: 'BRLC',
        key: 'BRLC',
        render: (o, row, index) => {
          return <div>{MyUtil.formatMoney(row.BRLC)}</div>
        },
      },{
        title: <div onClick={this.onSort("2")}>{((order == "2" )||(order == "3" ))?((order == "3" )?"本月累计变动↑":"本月累计变动↓") : "本月累计变动"}</div>,
        dataIndex: 'BSY',
        key: 'BSY',
        render: (o, row, index) => {
          return <div>{MyUtil.formatMoney(row.BSY)}</div>
        },
      },{
        title: <div onClick={this.onSort("10")}>{(order == "10" )?"本月资金流入↓":"本月资金流入"}</div>,
        dataIndex: 'BYLR',
        key: 'BYLR',
        render: (o, row, index) => {
          return <div>{MyUtil.formatMoney(row.BYLR)}</div>
        },
      },{
        title: <div onClick={this.onSort("11")}>{(order == "11" )?"本月资金流出↓":"本月资金流出"}</div>,
        dataIndex: 'BYLC',
        key: 'BYLC',
        render: (o, row, index) => {
          return <div>{MyUtil.formatMoney(row.BYLC)}</div>
        },
      }
    ]
    let tab = [
      {
        label: org,
        value: 'org'
      }, {
        label: date,
        value: 'time'
      }
    ]
    let tabMa = [
      {
        label: date,
        value: 'time'
      }
    ]
    let selectCustName =this.state.selectCustName + "的资金流向"
    return(
      <div className={styles.depChange} >
          {/*机构 日期切换*/}
          {menus !== undefined && menus.length>0?
            <DownMenu
              name="depChange"
              tabs = { MyUtil.isMa(this.queryDetail.menuId)?tabMa:tab}
              menus = {menus}
              ifSession = {this.state.ifSession}
              select= {[[orgId,orgId],date]}
              onEvent = {this.handleOnTwoLeftEvent}
            />
            :''}
        <MfTLoader className="scrollRefresh"
                       style={{height: (this.queryDetail.fromType == "1" && this.query.orgName == undefined )?window.winHeight - 45-44-44:window.winHeight - 45-44}}
                       onLoadMore={this.onRefreshMore("tableValue")}
                       hasMore={this.props.depChange.poolFlag=="1"?true:false}
                       ref='depChange'
        >
          {bal?
            <div>
              <p className={styles.topTitle}><img src={tishi}/>该数据为原始口径数据，未还原分成调整</p>
              <p className={styles.unit}>
                <p>客户清单</p>
                <span>单位:万元</span>
              </p>
              <p className={styles.unitNote}><span style={{color:"#666",fontSize:"1.3rem"}}>(账户日资金净变动<span style={{color:"#D9374B"}}>≥{MyUtil.formatMoney(bal) || ""}</span>{unit})</span></p>
            </div>
            :null}
          {tableValue?
            <div>
          <ReactTable
            className="table"
            columns={columns}
            data={util.addTableKey(tableValue)}
            scroll={{ x: 'auto' }}
          />
          {tableValue.length>0?"":<p className={styles.nullData}>暂无数据</p>}
          {(noMore&&tableValue.length>0 )?<span className={styles.more}>没有更多了</span>:""}
            </div>
          :null}
        </MfTLoader>
          {/*资金流向弹窗*/}
          <div className={styles.modal}
               style={{display:this.state.showDetail?"flex":"none"}}>
            <div className={styles.layer}
                 onClick={this.onClose}
                 onTouchMove={this.onClose}
                 style={{
                   height: window.winHeight,
                   display:this.state.showDetail?"block":"none",
                   overflow:"hidden",
                 }}
            >
            </div>
            <PullToRefresh
              ref={el => this.ptr = el}
              style={{
                maxHeight: 350,
                overflow: 'auto',

              }}
              onScroll={(e)=>this.handleScroll(e.target)}
              indicator={{ deactivate: '上拉可以刷新' }}
              direction='up'
              //  refreshing={this.state.refreshing}
              refreshing={false}
              className="scrollRefresh"
              onRefresh={this.onRefreshMore("tableDetail")}>
              <div  className={styles.modalTitle}>{selectCustName}</div>
              <ul>
                {
                  tableDetail.length>0?
                    tableDetail.map((value,index)=>{
                      return (
                        <li  key={index}>
                          <p>交易日期:{value.DEAL_DT}</p>
                          <p>客户账号:{MyUtil.noTm(value.ACCT_NUM)}</p>
                          <p>交易金额:{MyUtil.formatMoney(value.JYYE)}</p>
                          <p>资金来源或用途:{value.LYYT}</p>
                          <p>交易渠道:{value.QD}</p>
                          <p>交易机构:{value.JYJG}</p>
                          <p>交易对手名称:{value.DSMC}</p>
                          <p>对手行名称:{value.DSHMC}</p>
                        </li>
                      )
                    }):""
                }
              </ul>
            </PullToRefresh>
            <div  className={styles.seeMore} style={{display:this.state.seeMore?'block':'none'}}>向下滑动查看更多</div>
          </div>

        <div className={styles.noDataModalWrap}  style={{display:this.state.showNoDataDetail?"flex":"none"}}>
          <div className={styles.noDataModal}>
            <p>暂无数据</p>
            <p  onClick={this.onClose}>好的</p>
          </div>
          <div className={styles.layerNoData}
               onClick={this.onClose}
               onTouchMove={this.onClose}
               style={{
                 height: window.winHeight,
                 display:this.state.showNoDataDetail?"block":"none",
                 overflow:"hidden",
               }}
          >
          </div>
        </div>
      </div>
    )
  }

  /* 设置导航头 */
  setTitleBar = () => {
    this.props.dispatch({
      type: 'app/setTitleBar',
      header: {
        title: "大额变动",
        leftTap: ()=>{
          this.setState({
            ifSession: false
          },()=>{
            this.props.dispatch({
              type: 'depChange/goBack',
            })
          })
        },
        rightName:'MCRM/Remind/gengduo',
        rightTap:(item)=>{
          if(item.code=="message"){
            window.jsBridge.jumpToMessage();
          }else{
            // 路由跳转
            this.context.router.history.push(
              {
                pathname:"/remindSet",
                query:{
                  id:MyUtil.isMa(this.queryDetail.menuId) ? '002002' : '002001',
                }
              })
          }
        },
        menuList:[
          {title:"消息提醒",icon:"MCRM/Remind/xiaoxi",code:"message",textStyle:{}},
          {title:"消息提醒设置",icon:"MCRM/Remind/shezhi",code:"set",textStyle:{}}
        ],
      }
    })
  }

  //flagTab=0 初始化会调第一个接口； flagTab=1 点击本日净投放只调第二个接口
  getInitData = (flagTab) => {
    let { date,orgId,order} = this.props.depChange
    if(flagTab != "2"){
     // this.refs.depChange.refs.panel.scrollTo(0,0)
      this.refs.depChange.refs.panel.scrollTop=0
    }
      this.props.dispatch({
        type: 'depChange/getInitData',
        payload: {
          flag:flagTab,
          para:  MyUtil.isMa(this.queryDetail.menuId) ? '002002' : '002001',
          role:MyUtil.isMa(this.queryDetail.menuId)? '1' : '2',
          objNum: MyUtil.isMa(this.queryDetail.menuId) ? this.queryDetail.user.empId: orgId ,
          etlDate: date,
          businessType: "1",
          order: flagTab == "1" ? "0": order,
          pageNum: "1",
          acctNum: this.state.CUST_ID,
          msgId:this.queryDetail.msgId,
        }
      }).then(
        ()=>{
          if(flagTab == "1" ){
            this.openModal()
          }
        }
      )
  }

  handleScroll= (e) =>{
    let {detailFlag} = this.props.depChange
    let scrollHeight =  e.scrollHeight
    let newHeight = 350 + e.scrollTop
    if((newHeight == scrollHeight || newHeight > scrollHeight)&& detailFlag== "0"){
      this.setState({
        seeMore: false
      });
    }else{
      this.setState({
        seeMore: true
      });
    }
  }

  /* 上拉加载更多 */
  onRefreshMore = (moreFlag) => {
    let {date,orgId,poolFlag,detailFlag,tableDetail,tableValue,order} = this.props.depChange
    return (resolve) => {
      if (((moreFlag == "tableValue") && (poolFlag == "1")) || ((moreFlag == "tableDetail") && (detailFlag == "1"))) {
        this.props.dispatch({
          type: ((moreFlag == "tableValue") && (poolFlag == "1")) ? 'depChange/getMoreTableData' : 'depChange/getMoreDetailData',
          payload: {
            key: moreFlag,
            para: MyUtil.isMa(this.queryDetail.menuId)? '002002' : '002001',
            msgId:this.queryDetail.msgId,
            role:MyUtil.isMa(this.queryDetail.menuId)? '1' : '2',
            objNum: MyUtil.isMa(this.queryDetail.menuId) ? this.queryDetail.user.empId :orgId ,
            etlDate: date,
            businessType: "1",
            order: moreFlag == "tableDetail" ? "0" : order,
            pageNum: moreFlag == "tableDetail" ? (tableDetail.length / 10) + 1 + "" : (tableValue.length / 20) + 1 + "",
            acctNum: moreFlag == "tableDetail" ? this.state.CUST_ID : ""
          }
        }).then(() => {
          if(moreFlag == "tableValue"){
            resolve();
          }
        })
      }
    }
  }

  //资产变动表格排序点击事件
  onSort = (key) => {
    let {order} = this.props.depChange
    return () => {
      if(key=="1"){
        newPromise.then(()=>{
          this.props.dispatch({
            type: 'depChange/saveOrder',
            payload: {
              order:order == "1" ? "0" : "1",
            }
          })
        }).then(()=>{this.getInitData("0")})
      }else if(key=="2"){
        newPromise.then(()=>{
          this.props.dispatch({
            type: 'depChange/saveOrder',
            payload: {
              order:order == "2" ? "3" : "2"
            }
          })

        }).then(()=>{this.getInitData("0")})
      } else{
        newPromise.then(()=>{
          this.props.dispatch({
            type: 'depChange/saveOrder',
            payload: {
              order:key
            }
          })

        }).then(()=>{this.getInitData("0")})
      }
    }
  }
  // 关闭弹窗
  onClose = () =>  {
    document.getElementsByClassName('scrollRefresh')[0].scrollTop=0
    this.setState({
      showDetail:false,
      seeMore:false,  //弹窗查看更多
      showNoDataDetail:false
    });
  }
  // 打开弹窗
  openModal = () =>  {
    let {tableDetail} = this.props.depChange

    if(tableDetail.length>0){
      this.setState({
        showDetail:true,
      });
    }else{
      this.setState({
        showNoDataDetail:true,
      });
    }
  }
   //切换机构 和 日期 发送请求
  handleOnTwoLeftEvent = (p, e, i) => {
    //   e.children 没有值=》2级，tabType为1  ； e.children 有值=》1级，tabType为0
    // orgType =0 非全行规则  orgType =1 全行规则
    if(e.children){
      this.props.dispatch({
        type:"depChange/getMenusInfo",
        payload:{
          orgId: e.value,
          tabType:"1",
          orgType:"0",
          reqChannel:"1"
        }
      })
    }
    else{
      newPromise.then(()=>{
        if(p =="time"){
          this.props.dispatch({
            type: 'depChange/saveDate',
            payload: {
              date: e.value,
            }
          })
        }else{
          this.props.dispatch({
            type: 'depChange/saveOrg',
            payload: {
              orgId: e.value,
              org: e.label,
            }
          })
        }
      }).then(()=>{this.getInitData("0")})

    }
  }

  /* 还原高度 */
  restore = () => {
    this.refs.depChange.refs.panel.scrollTop = util.ssGet("depChangeTop","scroll")
  }
}

DepChange.propTypes = {}

export default connect((state) => state)(DepChange)
