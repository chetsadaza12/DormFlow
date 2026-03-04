// Settings Controller
// TODO: เชื่อมต่อกับฐานข้อมูลจริง

export const getSettings = async (req, res) => {
    try {
        // TODO: ดึงจาก DB
        res.json({ message: 'GET settings - TODO' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const settings = req.body;
        // TODO: บันทึกลง DB
        res.json({ message: 'Settings updated - TODO', data: settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRates = async (req, res) => {
    try {
        // TODO: ดึงจาก DB
        res.json({ message: 'GET rates - TODO' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRates = async (req, res) => {
    try {
        const rates = req.body;
        // TODO: บันทึกลง DB
        res.json({ message: 'Rates updated - TODO', data: rates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
