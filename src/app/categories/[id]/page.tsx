"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";

export default function CategoryTalentsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params?.id as string;
  const categoryNameFromQuery = searchParams.get("name");
  const [category, setCategory] = useState<any>(null);
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // بحث وفلترة
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [talentStats, setTalentStats] = useState<any>({});
  // إضافة متغيرات العمر
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    fetch(`/api/categories`)
      .then(res => res.json())
      .then(data => {
        const cat = data.find((c: any) => c.id === categoryId);
        setCategory(cat);
      });
    fetch(`/api/accounts?categoryId=${categoryId}&role=talent`)
      .then(res => res.json())
      .then(async data => {
        setTalents(data);
        // جلب إحصائيات التقييم لكل موهبة
        const stats: any = {};
        await Promise.all(data.map(async (talent: any) => {
          const res = await fetch(`/api/reviews?userId=${talent.id}`);
          const reviews = await res.json();
          const count = reviews.length;
          const avg = count > 0 ? (reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / count).toFixed(1) : null;
          stats[talent.id] = { avg, count };
        }));
        setTalentStats(stats);
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  // فلترة المواهب حسب البحث والعمر
  const filteredTalents = talents.filter(talent => {
    const matchesSearch =
      talent.name?.toLowerCase().includes(search.toLowerCase()) ||
      talent.bio?.toLowerCase().includes(search.toLowerCase());
    const matchesAgeFrom = ageFrom ? (talent.age || 0) >= Number(ageFrom) : true;
    const matchesAgeTo = ageTo ? (talent.age || 0) <= Number(ageTo) : true;
    return matchesSearch && matchesAgeFrom && matchesAgeTo;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          {categoryNameFromQuery || category?.name || "..."}
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-funnel w-5 h-5 text-orange-400" aria-hidden="true"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path></svg>
            <button className={`px-4 py-2 rounded-lg border bg-blue-900/40 text-blue-100 border-blue-400/20 transition-all font-bold ${sort==='price'?'ring-2 ring-orange-400':''}`} onClick={()=>setSort('price')}>السعر</button>
            <button className={`px-4 py-2 rounded-lg border bg-blue-900/40 text-blue-100 border-blue-400/20 transition-all font-bold ${sort==='rating'?'ring-2 ring-orange-400':''}`} onClick={()=>setSort('rating')}>التقييم</button>
            <button className={`px-4 py-2 rounded-lg border bg-blue-900/40 text-blue-100 border-blue-400/20 transition-all font-bold ${sort==='latest'?'ring-2 ring-orange-400':''}`} onClick={()=>setSort('latest')}>الأحدث</button>
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search w-5 h-5 text-blue-200" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم الموهبة..." className="px-4 py-2 rounded-lg bg-blue-900/40 border border-blue-400/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-blue-200" />
          </div>
        </div>
        {/* grid المواهب */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[120px]"><span className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></span></div>
        ) : filteredTalents.length === 0 ? (
          <div className="text-blue-200 text-center">لا يوجد مواهب في هذا التصنيف بعد.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredTalents.map(talent => (
              <div key={talent.id} className="bg-indigo-800/30 rounded-xl p-6 border border-blue-400/30 hover:bg-indigo-800/50 transition-all shadow-lg flex flex-col items-center">
                {talent.profileImageData ? (
                  <img src={`data:image/png;base64,${talent.profileImageData}`} alt={talent.name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-orange-400" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-900/40 flex items-center justify-center text-blue-200 mb-4 text-4xl">👤</div>
                )}
                <h3 className="text-xl font-bold mb-2">{talent.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={18} className={talentStats[talent.id]?.avg && i <= Math.round(Number(talentStats[talent.id].avg)) ? "text-orange-400 fill-current" : "text-blue-400"} />
                  ))}
                  <span className="text-blue-100 text-sm">
                    {talentStats[talent.id]?.avg ? `(${talentStats[talent.id].avg}/5) من ${talentStats[talent.id].count} تقييم` : '(لا يوجد تقييمات)'}
                  </span>
                </div>
                <div className="text-blue-100 mb-2 text-center">{talent.jobTitle || ''}</div>
                <div className="font-bold text-orange-400 mb-2">{talent.price ? `${talent.price} ر.س` : ''}</div>
                <a href={`/profile/${talent.id}`} className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg text-white font-bold hover:from-orange-500 hover:to-pink-600 transition-all">عرض البروفايل</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 