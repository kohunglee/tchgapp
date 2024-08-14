// pages/zz-inpage/bnsinfor.js
Page({

  data: {
    isLogin : false,
    businessListStorage: {  // 临时储存的
      u32 : { uid : 32, name : '李记扁粉大酒店', operatingHours : '6:00 ~ 23:00', awayFrom : '1 km', introduction : '李记扁粉大酒店，坐落于繁华之中，却独守一份传统与经典的韵味。这里以闻名遐迩的扁粉为主打，每一根扁粉都蕴含着匠人的精心与岁月的沉淀，滑而不腻，香醇可口，令人回味无穷。酒店不仅保留了扁粉这一传统美食的精髓，更将各式佳肴巧妙融合，满足食客对美味的多元化追求。 步入酒店，古朴典雅的装潢映入眼帘，温馨舒适的环境让人瞬间放松。宽敞明亮的用餐区域，无论是家庭聚餐还是商务宴请，都能找到合适的座位。而李记扁粉大酒店的服务更是周到细致，从迎宾到送客，每一个环节都力求完美，让每一位顾客都能感受到宾至如归的温暖。 在这里，品尝的不仅是美食，更是一种文化的传承与体验。李记扁粉大酒店，用心烹饪每一道菜肴，以诚待客，期待您的光临，共赴一场味蕾与心灵的双重盛宴。'},
      u41 : { uid : 41, name : '重庆火锅', operatingHours : '8:00 ~ 24:00', awayFrom : '0.7 km', introduction : '李记扁粉大酒店，坐落于繁华之中，却独守一份传统与经典的韵味。这里以闻名遐迩的扁粉为主打，每一根扁粉都蕴含着匠人的精心与岁月的沉淀，滑而不腻，香醇可口，令人回味无穷。酒店不仅保留了扁粉这一传统美食的精髓，更将各式佳肴巧妙融合，满足食客对美味的多元化追求。 步入酒店，古朴典雅的装潢映入眼帘，温馨舒适的环境让人瞬间放松。宽敞明亮的用餐区域，无论是家庭聚餐还是商务宴请，都能找到合适的座位。而李记扁粉大酒店的服务更是周到细致，从迎宾到送客，每一个环节都力求完美，让每一位顾客都能感受到宾至如归的温暖。 在这里，品尝的不仅是美食，更是一种文化的传承与体验。李记扁粉大酒店，用心烹饪每一道菜肴，以诚待客，期待您的光临，共赴一场味蕾与心灵的双重盛宴。'},
      u42 : { uid : 42, name : '冯记淄博烧烤', operatingHours : '12:00 ~ 23:00', awayFrom : '0.2 km', introduction : '李记扁粉大酒店，坐落于繁华之中，却独守一份传统与经典的韵味。这里以闻名遐迩的扁粉为主打，每一根扁粉都蕴含着匠人的精心与岁月的沉淀，滑而不腻，香醇可口，令人回味无穷。酒店不仅保留了扁粉这一传统美食的精髓，更将各式佳肴巧妙融合，满足食客对美味的多元化追求。 步入酒店，古朴典雅的装潢映入眼帘，温馨舒适的环境让人瞬间放松。宽敞明亮的用餐区域，无论是家庭聚餐还是商务宴请，都能找到合适的座位。而李记扁粉大酒店的服务更是周到细致，从迎宾到送客，每一个环节都力求完美，让每一位顾客都能感受到宾至如归的温暖。 在这里，品尝的不仅是美食，更是一种文化的传承与体验。李记扁粉大酒店，用心烹饪每一道菜肴，以诚待客，期待您的光临，共赴一场味蕾与心灵的双重盛宴。'},
      u43 : { uid : 43, name : '安阳大烩菜', operatingHours : '9:00 ~ 21:00', awayFrom : '4 km', introduction : '李记扁粉大酒店，坐落于繁华之中，却独守一份传统与经典的韵味。这里以闻名遐迩的扁粉为主打，每一根扁粉都蕴含着匠人的精心与岁月的沉淀，滑而不腻，香醇可口，令人回味无穷。酒店不仅保留了扁粉这一传统美食的精髓，更将各式佳肴巧妙融合，满足食客对美味的多元化追求。 步入酒店，古朴典雅的装潢映入眼帘，温馨舒适的环境让人瞬间放松。宽敞明亮的用餐区域，无论是家庭聚餐还是商务宴请，都能找到合适的座位。而李记扁粉大酒店的服务更是周到细致，从迎宾到送客，每一个环节都力求完美，让每一位顾客都能感受到宾至如归的温暖。 在这里，品尝的不仅是美食，更是一种文化的传承与体验。李记扁粉大酒店，用心烹饪每一道菜肴，以诚待客，期待您的光临，共赴一场味蕾与心灵的双重盛宴。'},
    },
    view : {
      name : '',
      operatingHours : '',
      awayFrom : '',
      introduction : '',
    }
  },

  /* 入口 */
  onLoad(option) {
    const thisView = this;
    const eventChannel = thisView.getOpenerEventChannel();  // 通信通道
    eventChannel.on('dataTransform', function(data) {  // 获取到信息后，构建 商家详情页
      thisView.initBnsInfor(data);
    })
  },

  /* 根据「通信通道」传来的信息，进行页面初始化 */
  initBnsInfor : function(data) {
    const thisView = this;
    console.log(data);
    thisView.data.isLogin = data.isLogin;
    const bnsuid = data.bnsuid;
    console.log(thisView.data.businessListStorage['u32']);
    var bnsStorageData = thisView.data.businessListStorage['u' + bnsuid];
    if(bnsStorageData) {
      thisView.setData({ view : thisView.data.businessListStorage['u' + bnsuid] });
    } else {
      thisView.setData({ view : { name : '该饭店的信息未设置' } });
    }
    
  }

})