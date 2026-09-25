export const LOG_TEMPLATES = {
  Building: ["新增楼栋档案", "更新楼栋信息", "调整楼栋状态", "导出楼栋台账"],
  FireDevice: ["登记消防设备", "更新设备信息", "变更设备状态", "导出设备台账"],
  InspectionTask: ["创建巡检任务", "更新巡检任务", "变更任务状态", "导出巡检任务"],
  InspectionResult: ["录入巡检结果", "更新巡检结果", "判定结果异常", "导出巡检结果"],
  HazardTicket: ["隐患派单", "更新整改单", "变更整改状态", "导出整改台账"]
};

export const LOG_ACTION_TEMPLATES = {
  login: "用户登录系统",
  claim: "领取巡检任务",
  submit: "提交巡检结果",
  review: "复核巡检任务",
  dispatch: "隐患派单",
  rectify: "填写整改结果",
  close: "复验关闭隐患"
};
