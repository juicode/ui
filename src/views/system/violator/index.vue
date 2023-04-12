<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="举报人" prop="informant">
        <el-input
          v-model="queryParams.informant"
          placeholder="请输入举报人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="举报者身份证号" prop="informantIdNumber">
        <el-input
          v-model="queryParams.informantIdNumber"
          placeholder="请输入举报者身份证号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="举报者手机号" prop="informantPhone">
        <el-input
          v-model="queryParams.informantPhone"
          placeholder="请输入举报者手机号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="违法者" prop="violator">
        <el-input
          v-model="queryParams.violator"
          placeholder="请输入违法者"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="违法者身份证号" prop="violatorIdNumber">
        <el-input
          v-model="queryParams.violatorIdNumber"
          placeholder="请输入违法者身份证号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="违法者车牌号" prop="violatorCarNumber">
        <el-input
          v-model="queryParams.violatorCarNumber"
          placeholder="请输入违法者车牌号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="违法时间" prop="illegalTime">
        <el-date-picker clearable
          v-model="queryParams.illegalTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择违法时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="违法计分" prop="illegalScoring">
        <el-input
          v-model="queryParams.illegalScoring"
          placeholder="请输入违法计分"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:violator:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:violator:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:violator:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:violator:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="violatorList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="交通违法记录Id" align="center" prop="id" />
      <el-table-column label="举报者" align="center" prop="informant" />
      <el-table-column label="举报者身份证号" align="center" prop="informantIdNumber" />
      <el-table-column label="举报者手机号" align="center" prop="informantPhone" />
      <el-table-column label="违法者车牌号" align="center" prop="violatorCarNumber" />
      <el-table-column label="违法行为" align="center" prop="illegalActivities" />
      <el-table-column label="违法时间" align="center" prop="illegalTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.illegalTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:violator:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:violator:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改违法记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="违法者" prop="violator">
          <el-input v-model="form.violator" placeholder="请输入违法者" />
        </el-form-item>
        <el-form-item label="违法者身份证号" prop="violatorIdNumber">
          <el-input v-model="form.violatorIdNumber" placeholder="请输入违法者身份证号" />
        </el-form-item>
        <el-form-item label="违法者车牌号" prop="violatorCarNumber">
          <el-input v-model="form.violatorCarNumber" placeholder="请输入违法者车牌号" />
        </el-form-item>
        <el-form-item label="违法图片" prop="img">
          <imageUpload v-model="form.img" :limit="1" disabled="true"/>
        </el-form-item>
        <el-form-item label="违法行为" prop="illegalActivities">
          <el-input v-model="form.illegalActivities" placeholder="请输入违法行为" />
        </el-form-item>
        <el-form-item label="违法时间" prop="illegalTime">
          <el-date-picker clearable
            v-model="form.illegalTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择违法时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listViolator, getViolator, delViolator, addViolator, updateViolator } from "@/api/system/violator";

export default {
  name: "Violator",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 违法记录表格数据
      violatorList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        informant: null,
        informantId: null,
        informantIdNumber: null,
        informantPhone: null,
        violator: null,
        violatorId: null,
        violatorIdNumber: null,
        violatorIdPhone: null,
        violatorCarNumber: null,
        img: null,
        illegalActivities: null,
        illegalTime: null,
        illegalScoring: null,
        illegalFines: null,
        illegalPlace: null,
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询违法记录列表 */
    getList() {
      this.loading = true;
      listViolator(this.queryParams).then(response => {
        this.violatorList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        informant: null,
        informantId: null,
        informantIdNumber: null,
        informantPhone: null,
        violator: null,
        violatorId: null,
        violatorIdNumber: null,
        violatorIdPhone: null,
        violatorCarNumber: null,
        img: null,
        illegalActivities: null,
        illegalTime: null,
        illegalScoring: null,
        illegalFines: null,
        illegalPlace: null,
        status: "0",
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加违法记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getViolator(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改违法记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateViolator(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addViolator(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除违法记录编号为"' + ids + '"的数据项？').then(function() {
        return delViolator(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/violator/export', {
        ...this.queryParams
      }, `violator_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
