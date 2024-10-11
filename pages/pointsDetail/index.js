Page({
  data: {
    totalScore: 2300,
    scoreHistoryArrary: []
  },

  onLoad: function() {
    // 模拟从服务端获取的数据
    const rawData = [
      {
        "userId": 384,
        "scoreComment": "完成考试获得积分",
        "rewardScore": 1500.00,
        "creationTime": "2024-06-01T07:32:02.8550826",
        "id": "cdd0c849-8c27-4cf8-d429-08dc81c9e022"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[骑跨CPR]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-01T07:37:58.1538401",
        "id": "78f1af15-8c48-4ab9-d42a-08dc81c9e022"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[骑跨CPR]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-01T07:37:58.1553811",
        "id": "f4e5cfa8-f505-4c45-d42b-08dc81c9e022"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[呼喊求助]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-01T07:42:22.6584009",
        "id": "5b4b3a74-0028-4c2a-d42c-08dc81c9e022"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[急救箱]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-01T07:46:15.0196545",
        "id": "25bcab90-004b-4f8c-d42d-08dc81c9e022"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[急救箱]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-01T07:46:15.0197924",
        "id": "2f90d6a7-a05e-4f30-d42e-08dc81c9e022"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[人工呼吸]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-18T22:23:13.1366826",
        "id": "8d79c784-214e-4f70-1148-08dc8fa22fee"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[伤口出血]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-18T22:27:57.6748165",
        "id": "eb0e65a1-8e40-4647-1149-08dc8fa22fee"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[胸外按压]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-19T14:51:19.2811473",
        "id": "3acf02fe-e8d2-4b2e-dc29-08dc902c3939"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[胸外按压]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-19T14:51:19.2811475",
        "id": "380ccb6c-62fb-4aba-dc2a-08dc902c3939"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[拨打120]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-21T00:05:41.9743702",
        "id": "7ed3031b-e4ef-411a-d561-08dc9142d5bf"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[检查反应]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-24T16:09:22.8981603",
        "id": "aa249e7c-36d1-453c-da56-08dc9424f4f1"
      },
      {
        "userId": 384,
        "scoreComment": "完成课程[检查反应]学习",
        "rewardScore": 100.00,
        "creationTime": "2024-06-24T16:09:22.8981561",
        "id": "bec110d5-f806-41cb-da57-08dc9424f4f1"
      }
      // 更多数据...
    ];

    // 处理数据，格式化日期
    const formattedData = rawData.map(item => {
      return {
        ...item,
        formattedDate: this.formatDate(item.creationTime)
      };
    });

    this.setData({
      scoreHistoryArrary: formattedData
    });
  },

  formatDate: function(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
});

