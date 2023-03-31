import emitter from "@/eventBus"

/*
* 适配消息通知的简便写法
*
*/
const convertMsgToNotification=(...params)=>{
    let res = {}
    params.forEach((item)=>{
            let colorStatus: string
            let icon = 'mdi-information'
            switch (payload.level) {
                case "error":
                    colorStatus = "red"
                    icon = "mdi-close-circle"
                    break;
                case "warning":
                    colorStatus = "yellow"
                    icon = "mdi-alert-box"
                    break;
                case "info":
                    colorStatus = "blue"
                    break;
                case "success":
                    colorStatus = "green"
                    icon = "mdi-check-circle"
                    break;

                default:
                    break;
            }
            let foo = {
                message: item.msg,
                type: "html",
                title: item.level,
                colorStatus,
                icon,
                actionButtons: item.actionButtons
            }
       res[item.name] = foo
    })
    
    return res
}

const getNotification = (params) => {
  const notifications = {
  removeTabSucceed: {
  action: 'add',
  timeout: 3000,
  closeButton: true,
  colorStatus: 'blue',
  title: '关闭标签页成功',
  message: params?.props?.error,
  },
  
  ...convertMsgToNotification(
  {
      name: "resetSettings",
      level: "success",
      msg: "设置重置成功。<br>有些设置可能需要重启app才能应用!"  
  },
  {
      name: "removeStore"
      level: "warning",
      msg: "确实要移除这个加密库吗<br>现在你有几秒时间来作出决定",
      actionButtons: [
      {
          title: '确定',
          onClick:()=>{
              params.props.onClickConfirm()
              emitter.emit("showMsg", { level: "success", msg: "store移除成功，这并不会删除源文件！" })  
          },
      },
      {
          title: '取消'
      },
      ]
  }
  )
}

  return params?.name ? notifications[params.name] : {}
}

const emit = (params) => {
  const notification = getNotification(params)
  notification.hide = () => hide(notification)
  notification.update = (params) => update(notification, params)
  emitter.emit('notification', notification)
  return notification
}

const update = (notification, params = null) => {
  const newNotification = getNotification(params)
  for (const [key, value] of Object.entries(newNotification)) {
    if (!['hashID', 'id'].includes(key)) {
      notification[key] = value
    }
  }
  emitter.emit('notification', notification)
}

const hide = (notification) => {
  notification.action = 'hide'
  update(notification)
}

const hideByHashID = (hashID) => {
  emitter.emit('notification', {
    action: 'hide',
    hashID,
  })
}

export {
  emit,
  hideByHashID,
}

export { 
    showResetSettingsMsg:()=>{
        emitter.emit('showMsg',
        { level: "success",
          msg: "设置重置成功。<br>有些设置可能需要重启app才能应用!" 
      
    }),
    
    showRemoveStoreMsg(onClickConfirm) {
            emitter.emit("showMsg", {
                level: "warning",
                msg: "确实要移除这个加密库吗<br>现在你有几秒时间来作出决定",
                actionButtons: [
                    {
                        title: '确定',
                        onClick:()=>{
                            onClickConfirm()
                            emitter.emit("showMsg", { level: "success", msg: "store移除成功，这并不会删除源文件！" })  
                            },
                    },
                    {
                        title: '取消'
                    },
                ]
            })
    }
    
}

}