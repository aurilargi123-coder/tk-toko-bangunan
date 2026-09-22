import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Database, 
  FolderTree, 
  ShieldCheck, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { 
  SUPABASE_SQL_SCHEMA, 
  NEXTJS_SUPABASE_CLIENT_CODE, 
  NEXTJS_MIDDLEWARE_CODE, 
  NEXTJS_FOLDER_STRUCTURE 
} from '../data/supabaseSqlScript';

export const SqlGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'client' | 'middleware' | 'structure'>('sql');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Skrip SQL Supabase &amp; Panduan Integrasi Next.js
            </h2>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold">
              Dokumentasi Siap Pakai
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Salin skrip SQL PostgreSQL lengkap (dengan RLS &amp; trigger pengurangan stok otomatis), inisialisasi client, dan middleware RBAC.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            <span>Buka Supabase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'sql'
              ? 'bg-slate-900 border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Skrip SQL Supabase (Lengkap + Trigger)</span>
        </button>

        <button
          onClick={() => setActiveTab('client')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'client'
              ? 'bg-slate-900 border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>2. lib/supabaseClient.js</span>
        </button>

        <button
          onClick={() => setActiveTab('middleware')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'middleware'
              ? 'bg-slate-900 border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. middleware.ts (RBAC Route Guard)</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
            activeTab === 'structure'
              ? 'bg-slate-900 border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>4. Struktur Folder Next.js App Router</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {activeTab === 'sql' && (
          <div>
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">
                  schema.sql — Supabase SQL Editor
                </span>
                <span className="text-[11px] text-slate-500">
                  Termasuk tabel profiles, categories, products, transactions, transaction_items, RLS, &amp; Trigger auto reduce stock.
                </span>
              </div>
              <button
                onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'sql')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors"
              >
                {copied === 'sql' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin SQL Lengkap</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}

        {activeTab === 'client' && (
          <div>
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                lib/supabaseClient.js
              </span>
              <button
                onClick={() => handleCopy(NEXTJS_SUPABASE_CLIENT_CODE, 'client')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors"
              >
                {copied === 'client' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed select-all">
              {NEXTJS_SUPABASE_CLIENT_CODE}
            </pre>
          </div>
        )}

        {activeTab === 'middleware' && (
          <div>
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                middleware.ts (Next.js App Router RBAC Guard)
              </span>
              <button
                onClick={() => handleCopy(NEXTJS_MIDDLEWARE_CODE, 'middleware')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors"
              >
                {copied === 'middleware' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed select-all">
              {NEXTJS_MIDDLEWARE_CODE}
            </pre>
          </div>
        )}

        {activeTab === 'structure' && (
          <div>
            <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Struktur Folder Proyek Next.js App Router
              </span>
              <button
                onClick={() => handleCopy(NEXTJS_FOLDER_STRUCTURE, 'structure')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors"
              >
                {copied === 'structure' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Struktur</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed select-all">
              {NEXTJS_FOLDER_STRUCTURE}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
