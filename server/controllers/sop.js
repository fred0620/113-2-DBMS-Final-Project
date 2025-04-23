const { logSOPView } = require('../services/viewService');
const { Viewers_NUM } = require('../models/viewModel');

const getSopPage = async (req, res) => {
    const sopId = req.params.id;
  
    await logSOPView(req, sopId);
  
    const viewCount = await Viewers_NUM(sopId);
  
    res.json({ message: `You viewed SOP ${sopId}`, views: viewCount });
  };
  
  module.exports = { getSopPage };