/*
 * @Author: 王硕
 * @Date: 2020-02-05 17:34:45
 * @LastEditors: 王硕
 * @LastEditTime: 2020-02-21 18:44:24
 * @Description: file content
 */
import React, { Component } from 'react';
import { Modal, Button, message } from 'antd';
import { connect } from 'dva';
import DragTree from '@/components/DragTree/dragTree';
import RoleForm from './roleForm';
import ToRoleForm from './toRoleForm';
import './index.css';
const { confirm } = Modal;
@connect(
  ({ auth, project }) => ({
    projectId: project.projectDetail.id,
    authList: auth.authList,
  }),
  dispatch => ({
    deleteAuth: payload => dispatch({ type: 'auth/deleteAuth', payload }),
    fetchAuthList: payload => dispatch({ type: 'auth/getAuthList', payload }),
    setAuthList: payload => dispatch({ type: 'auth/setAuthList', payload }),
    setAuthAssignForRole: payload => dispatch({ type: 'authAssign/setAuthAssignForRole', payload }),
  }),
)
class index extends Component {
  state = { visible: false, roleVisible: false, roleDetail: {}, parentId: '', showRoleForm: false };
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
      case 'apartment':
        this.toRole(item);
        break;
      default:
        break;
    }
  };
  editPer(item, parentId) {
    this.setState({
      visible: true,
      roleDetail: item,
      parentId: parentId,
    });
  }
  deletePer(item, parentId) {
    const { fetchAuthList, deleteAuth, projectId } = this.props;
    confirm({
      title: `您确认要删除"${item.name}"吗？`,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        deleteAuth({ id: item.id }).then(res => {
          if (res.code === 200) {
            message.success('删除成功');
            fetchAuthList(projectId);
          } else {
            message.error(res.message);
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
  toRole(item) {
    this.setState({
      roleVisible: true,
      roleDetail: item,
      showRoleForm:true
    });
  }
  hideModal = () => {
    this.setState({
      visible: false,
    });
    setTimeout(() => {
      this.setState({
        roleDetail: {},
      });
    }, 200);
  };
  roleHideModal = () => {
    const { setAuthAssignForRole } = this.props;
    setAuthAssignForRole([]);
    this.setState({
      roleVisible: false,
    });
    setTimeout(() => {
      this.setState({
        showRoleForm:false,
        roleDetail: {}
      })
    }, 200);
    // setTimeout(() => {
    //   this.setState({
    //     showRoleForm:false
    //   })
    // },300)
  };
  onEditEnd = () => {
    const { fetchAuthList, projectId } = this.props;
    this.hideModal();
    fetchAuthList(projectId);
  };
  onEditToRole = () => {
    this.roleHideModal()
  };
  render() {
    const { visible, roleDetail, parentId, roleVisible,showRoleForm } = this.state;
    const iconData = { 'plus-square': '添加', edit: '编辑', apartment: '权限分配', delete: '删除' };
    return (
      <>
        <Button type="primary" onClick={() => this.addPer('')}>
          新增角色
        </Button>
        <DragTree
          authKey="role"
          iconData={iconData}
          onOption={this.onOption}
          onDrop={this.onDrop}
        />
        <Modal
          title={roleDetail.id ? '编辑角色' : '新增角色'}
          visible={visible}
          onCancel={this.hideModal}
          maskClosable={false}
          footer={null}
          afterClose={this.afterClose}
        >
          <RoleForm
            roleDetail={roleDetail}
            cancel={this.hideModal}
            parentId={parentId}
            onEditEnd={this.onEditEnd}
          />
        </Modal>
        <Modal
          title="权限分配"
          width={720}
          style={{ top: 20 }}
          visible={roleVisible}
          onCancel={this.roleHideModal}
          maskClosable={false}
          footer={null}
        >{showRoleForm? <ToRoleForm
          roleId={roleDetail.id}
          cancel={this.roleHideModal}
          onEditEnd={this.onEditToRole}
        />:null}

        </Modal>
      </>
    );
  }
}
export default index;
