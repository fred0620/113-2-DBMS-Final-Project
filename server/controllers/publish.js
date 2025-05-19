const { Publish } = require('../models/publishModel');

const update_publish = async (req, res) => {
  const sopId = req.params.sop_id;
  const is_publish = req.query.is_publish;

  //console.log('[DEBUG] Received request to update publish status');
  //console.log(`[DEBUG] sopId: ${sopId}`);
  //console.log(`[DEBUG] is_publish (raw): ${is_publish}`);

  try {
    const result = await Publish(sopId, is_publish);

    //console.log('[DEBUG] Result from Publish function:', result);

    if (result.error) {
      console.warn(`[WARN] Failed to update SOP publish status for SOP_ID=${sopId}`);
      return res.status(400).json({
        error: 'Failed to update publish status',
        detail: result.error,
      });
    }

    console.log(`[INFO] Successfully updated publish status for SOP_ID=${sopId}`);

    return res.status(200).json({
      message: 'Publish status updated successfully',
      sop_status: result.sop_status,
    });

  } catch (err) {
    console.error(`[SOP_ERROR] Failed to update publish status:`, err.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      detail: err.message,
    });
  }
};




module.exports = { update_publish  };