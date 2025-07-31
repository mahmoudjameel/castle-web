"use client";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Star, Search, Filter, SortAsc, Eye, Award, TrendingUp, Clock, Users } from "lucide-react";

// تعريف أنواع البيانات
interface Talent {
  id: number;
  name: string;
  bio?: string;
  age?: number;
  price?: number;
  jobTitle?: string;
  profileImageData?: string;
}

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  imageData?: string;
}

interface TalentStats {
  [key: number]: {
    avg: string | null;
    count: number;
  };
}

export default function CategoryTalentsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categoryId = params?.id as string;
  const categoryNameFromQuery = searchParams.get("name");
  const [category, setCategory] = useState<Category | null>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [talentStats, setTalentStats] = useState<TalentStats>({});
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    fetch(`/api/categories`)
      .then(res => res.json())
      .then((data: Category[]) => {
        const cat = data.find(c => c.id === categoryId);
        setCategory(cat || null);
      });
    fetch(`/api/accounts?categoryId=${categoryId}&role=talent`)
      .then(res => res.json())
      .then(async (data: Talent[]) => {
        setTalents(data);
        const stats: TalentStats = {};
        await Promise.all(data.map(async (talent: Talent) => {
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

  const filteredTalents = talents.filter((talent: Talent) => {
    const matchesSearch =
      talent.name?.toLowerCase().includes(search.toLowerCase()) ||
      talent.bio?.toLowerCase().includes(search.toLowerCase());
    const matchesAgeFrom = ageFrom ? (talent.age || 0) >= Number(ageFrom) : true;
    const matchesAgeTo = ageTo ? (talent.age || 0) <= Number(ageTo) : true;
    return matchesSearch && matchesAgeFrom && matchesAgeTo;
  });

  const getSortedTalents = () => {
    let sorted = [...filteredTalents];
    switch (sort) {
      case 'rating':
        return sorted.sort((a, b) => (Number(talentStats[b.id]?.avg) || 0) - (Number(talentStats[a.id]?.avg) || 0));
      case 'price':
        return sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
      case 'latest':
      default:
        return sorted.reverse();
    }
  };

  const getSortIcon = (sortType: string) => {
    switch (sortType) {
      case 'price': return <SortAsc className="w-4 h-4" />;
      case 'rating': return <Award className="w-4 h-4" />;
      case 'latest': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900">
      {/* خلفية مؤثرات بصرية */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400/5 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mb-4 transform rotate-12 shadow-lg">
              <Users className="w-8 h-8 text-white transform -rotate-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              {categoryNameFromQuery || category?.name || "..."}
            </h1>
            <p className="text-blue-200/80 text-lg">اكتشف أفضل المواهب في هذا التصنيف</p>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* البحث */}
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200/60" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث باسم الموهبة أو الوصف..."
                  className="w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-200 placeholder:text-blue-200/60"
                />
              </div>

              {/* أزرار الترتيب */}
              <div className="flex gap-2">
                {[
                  { key: 'latest', label: 'الأحدث' },
                  { key: 'rating', label: 'التقييم' },
                  { key: 'price', label: 'السعر' }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSort(option.key)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      sort === option.key
                        ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transform scale-105'
                        : 'bg-white/5 text-blue-200 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    {getSortIcon(option.key)}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>

              {/* زر الفلاتر */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  showFilters
                    ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white'
                    : 'bg-white/5 text-blue-200 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Filter className="w-4 h-4" />
                فلاتر
              </button>
            </div>

            {/* فلاتر العمر */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <span className="text-blue-200 font-semibold">فلترة حسب العمر:</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={ageFrom}
                      onChange={e => setAgeFrom(e.target.value)}
                      placeholder="من"
                      className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 placeholder:text-blue-200/60"
                    />
                    <span className="text-blue-200">إلى</span>
                    <input
                      type="number"
                      value={ageTo}
                      onChange={e => setAgeTo(e.target.value)}
                      placeholder="إلى"
                      className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50 placeholder:text-blue-200/60"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{filteredTalents.length}</div>
              <div className="text-blue-200/80 text-sm">موهبة متاحة</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {filteredTalents.length > 0 
                  ? (filteredTalents.reduce((sum, t) => sum + (Number(talentStats[t.id]?.avg) || 0), 0) / filteredTalents.length).toFixed(1)
                  : '0'
                }
              </div>
              <div className="text-blue-200/80 text-sm">متوسط التقييم</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {filteredTalents.length > 0 
                  ? Math.min(...filteredTalents.map(t => Number(t.price) || Infinity)).toFixed(0)
                  : '0'
                }
              </div>
              <div className="text-blue-200/80 text-sm">أقل سعر (ر.س)</div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">
                {Object.values(talentStats).reduce((sum, stat) => sum + (stat.count || 0), 0)}
              </div>
              <div className="text-blue-200/80 text-sm">إجمالي التقييمات</div>
            </div>
          </div>

          {/* عرض المواهب */}
          {loading ? (
            <div className="flex flex-col justify-center items-center min-h-[300px] gap-4">
              <div className="w-16 h-16 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></div>
              <p className="text-blue-200/80">جاري تحميل المواهب...</p>
            </div>
          ) : filteredTalents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">لا توجد نتائج</h3>
              <p className="text-blue-200/80">لا يوجد مواهب تطابق معايير البحث الحالية</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {getSortedTalents().map(talent => (
                <div key={talent.id} className="group bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl">
                  {/* صورة البروفايل */}
                  <div className="relative p-6 pb-4">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      {talent.profileImageData ? (
                        <img 
                          src={`data:image/png;base64,${talent.profileImageData}`} 
                          alt={talent.name} 
                          className="w-full h-full rounded-2xl object-cover border-2 border-orange-400/50 group-hover:border-orange-400 transition-colors"
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center text-4xl border-2 border-blue-400/50 group-hover:border-blue-400 transition-colors">
                          👤
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* معلومات الموهبة */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                        {talent.name}
                      </h3>
                      
                      {/* التقييم */}
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star 
                              key={i} 
                              size={16} 
                              className={`transition-colors ${
                                talentStats[talent.id]?.avg && i <= Math.round(Number(talentStats[talent.id].avg)) 
                                  ? "text-orange-400 fill-current" 
                                  : "text-blue-400/40"
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-blue-200/80 text-sm mr-2">
                          {talentStats[talent.id]?.avg 
                            ? `${talentStats[talent.id].avg} (${talentStats[talent.id].count})` 
                            : 'جديد'
                          }
                        </span>
                      </div>

                      {/* المهنة */}
                      {talent.jobTitle && (
                        <div className="inline-block px-3 py-1 bg-blue-400/20 rounded-full text-blue-200 text-sm mb-3">
                          {talent.jobTitle}
                        </div>
                      )}

                      {/* السعر */}
                      {talent.price && (
                        <div className="text-2xl font-bold text-orange-400 mb-4">
                          {talent.price} <span className="text-lg">ر.س</span>
                        </div>
                      )}

                      {/* زر عرض البروفايل */}
                      <a 
                        href={`/profile/${talent.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl text-white font-semibold hover:from-orange-500 hover:to-pink-600 transition-all duration-300 group-hover:transform group-hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <Eye className="w-4 h-4" />
                        عرض البروفايل
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}