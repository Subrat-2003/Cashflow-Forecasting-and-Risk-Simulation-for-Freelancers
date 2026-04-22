import React from 'react';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

const AddTransactionModal: React.FC<Props> = ({ onClose, onAdded }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-white">Add New Transaction</h2>
        <p className="text-gray-400 mb-6">Manually input data to see its impact on your Prophet AI forecast.</p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onAdded} 
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            Add Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
