/*
 * @Author: 王硕
 * @Date: 2020-02-05 17:34:45
 * @LastEditors  : 王硕
 * @LastEditTime : 2020-02-11 10:09:14
 * @Description: file content
 */
import React, { Component } from 'react';
import { Modal, Button, message, Descriptions } from 'antd';
import { connect } from 'dva';
import DragTree from '@/components/DragTree/dragTree';
import PerForm from './perForm';
import './index.css';
const { confirm } = Modal;
@connect(
  ({ auth, project,loading,authAssign }) => ({
    toWhoData:authAssign.toWhoData,
    projectId: project.projectDetail.id,
    authList: auth.authList,
  }),
  dispatch => ({
    dragItem: payload => dispatch({ type: 'auth/dragItem', payload }),
    deleteAuth: payload => dispatch({ type: 'auth/deleteAuth', payload }),
    fetchAuthList: payload => dispatch({ type: 'auth/getAuthList', payload }),
    getAssignedToWho: payload => dispatch({ type: 'authAssign/getAssignedToWho', payload }),
  }),
)
class index extends Component {
  state = { visible: false, perDetail: {}, parentId: '', eyeVisible: false };
  onDrop = info => {
    const { dragItem } = this.props;
    const id = info.dragNode.props.dataRef.id;
    let parentId;
    if (!info.dropToGap) {
      parentId = info.node.props.dataRef.id;
    } else {
      parentId = info.node.props.dataRef.parentId;
    }
    const level = info.node.props.pos.split('-').pop() - 0 + 1;
    dragItem({ id, parentId, level });
  };
  onOption = (item, parentId, type) => {
    switch (type) {
      case 'edit':
        this.editPer(item, parentId);
        break;
      case 'delete':
        this.deletePer(item, parentId);
        break;
      case 'plus-square':
        this.addPer(parentId);
        break;
      case 'eye':
        this.lookPer(item);
        break;
      default:
        break;
    }
  };
  editPer(item, parentId) {
    this.setState({
      visible: true,
      perDetail: item,
      parentId: parentId,
    });
    console.log(item, parentId, '1');
  }
  deletePer(item, parentId) {
    const { fetchAuthList, deleteAuth, projectId } = this.props;
    console.log(item, 'xxx');
    confirm({
      title: `您确认要删除"${item.name}"吗？`,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        deleteAuth({ id: item.id }).then(res => {
          if (res.code === 200) {
            message.success('删除成功');
            fetchAuthList(projectId);
          }
        });
      },
    });
  }
  addPer(parentId) {
    this.setState({
      visible: true,
      parentId: parentId,
    });
  }
  lookPer(item) {
    const { getAssignedToWho } = this.props;
    this.setState({
      eyeVisible: true,
    });
    getAssignedToWho({ itemId: item.id });
  }
  hideModal = () => {
    this.setState({
      visible: false,
      perDetail: {},
    });
  };
  hideEyeModal = () => {
    this.setState({
      eyeVisible: false,
    });
  };
  onEditEnd = () => {
    const { fetchAuthList, projectId } = this.props;
    this.setState({
      visible: false,
      perDetail: {},
    });
    fetchAuthList(projectId);
  };
  render() {
    const { visible, perDetail, parentId, eyeVisible } = this.state;
    const { authList, toWhoData} = this.props;
    const iconData = ['edit', 'delete', 'plus-square', 'eye'];
    return (
      <>
        <Button type="primary" onClick={() => this.addPer('')}>
          新增权限
        </Button>
        <DragTree
          treeData={authList['permission']}
          iconData={iconData}
          onOption={this.onOption}
          onDrop={this.onDrop}
        />
        <Modal
          title="创建/编辑权限"
          visible={visible}
          onCancel={this.hideModal}
          maskClosable={false}
          footer={null}
        >
          <PerForm
            perDetail={perDetail}
            cancel={this.hideModal}
            parentId={parentId}
            onEditEnd={this.onEditEnd}
          />
        </Modal>
        <Modal
          title="该权限分配给了？"
          visible={eyeVisible}
          onCancel={this.hideEyeModal}
          maskClosable={false}
          footer={null}
        >
          <Descriptions>
          <Descriptions.Item label="角色">
              {toWhoData['roles']}
            </Descriptions.Item>
            <Descriptions.Item label="人员">
            {toWhoData['users']}
            </Descriptions.Item>

          </Descriptions>
        </Modal>
      </>
    );
  }
}
export default index;
