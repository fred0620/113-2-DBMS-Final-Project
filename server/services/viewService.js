const { v4: uuidv4 } = require('uuid');
const { getLatestViewId, insertViewRecord } = require('../models/viewModel');

const logSOPView = async (req, sopId) => {
  let personalId;

  //if (req.user && req.user.id) {
    // 有登入，不是很確定
    //personalId = req.user.id;
  //} else {
    // 沒登入就給隨機 ID，存在 cookie
    //if (!req.cookies.personalId) {
      //personalId = `GUEST_${uuidv4()}`;
      //res.cookie('personalId', personalId, { httpOnly: true, maxAge: 31536000000 });
    //} else {
      //personalId = req.cookies.personalId;
    //}
  //}
  //測試先隨便設
  personalId ='Test'
  const viewId = await getLatestViewId();
  await insertViewRecord(viewId, sopId, personalId);
};

module.exports = { logSOPView };
