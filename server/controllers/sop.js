const sopModel = require('../models/sopsModel');
const { logSOPView } = require('../services/viewService');
const { Viewers_NUM } = require('../models/viewModel');

const getSopPage = async (req, res) => {
  const sopId = req.params.sop_id;

  try {
        
    // 取得 SOP 資料（nodes + edges）
    const {sop,  edges, module} = await sopModel.getSopById(sopId);
    if (!sop) {
      return res.status(404).json({ status: 'fail', message: 'NOT FOUND SOP' });
    }

    await logSOPView(req, sopId); // 記錄瀏覽行為
    const viewCount = await Viewers_NUM(sopId); // 查瀏覽數
    
    res.json({
      status: 'success',
      data:{...sop,
      nodes:module,
      edges:edges},
      message: `You viewed SOP ${sopId}`,
      views: viewCount,
    });
  } catch (err) {
    console.error(`[SOP_ERROR] Failed to load SOP ${sopId}:`, err.message);
    res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message
    });
  }
};

module.exports = { getSopPage };
