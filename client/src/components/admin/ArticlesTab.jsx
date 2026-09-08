export default function ArticlesTab({ 
    articles,
    onEdit,
    onCreate,
    onDelete,
    onTogglePublish
    }) {
  return (
    <div>
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-primary">Articles & Wellness Blog</h2>
          <p className="text-gray-500 text-sm">Overview of published publications and drafts.</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-primary hover:bg-[#3d4d40] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          + Write New Article
        </button>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-6">Article Title</th>
                <th className="p-6">Status</th>
                <th className="p-6">Created Date</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-gray-900">{article.title}</div>
                    <div className="text-xs text-gray-400 font-mono">/{article.slug}</div>
                  </td>
                  <td className="p-6">
                    <button
                      onClick={() => onTogglePublish(article.slug )}
                      title="Click to toggle publish status"
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        article.published 
                          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {article.published ? '● Published' : '○ Draft'}
                    </button>
                  </td>
                  <td className="p-6 text-gray-500 text-xs">
                    {new Date(article.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <button 
                      onClick={() => window.open(`/blog/${article.slug}`, '_blank')} 
                      className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => onEdit(article)} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onDelete(article.id)} 
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-400">No articles written yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}