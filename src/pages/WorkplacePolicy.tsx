import React from 'react';
import LegalPage from './LegalPage';
import { useTranslation } from 'react-i18next';

export default function WorkplacePolicy() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <LegalPage titleAr="سياسة بيئة العمل" titleEn="Workplace Policy">
      {isRtl ? (
        <div className="space-y-12 text-justify text-slate-700 leading-relaxed font-sans">
          {/* Header Metadata block */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mb-4">
              <span>الإصدار: 1.0</span>
              <span className="text-slate-300">|</span>
              <span>تاريخ النفاذ: يوليو 2026</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600 font-bold">تسري على: كافة الموظفين والاستشاريين والمتطوعين والزوار</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">مقدمة تمهيدية</h2>
            <p className="text-lg text-slate-800 leading-relaxed">
              يلتزم بيت الصحافة بتوفير بيئة عمل مهنية، وشاملة، وآمنة، وتشاركية تمكّن الموظفين والزملاء من تقديم صحافة استثنائية وعالية الجودة، وإعداد البحوث الرصينة، وتنفيذ البرامج التدريبية المتقدمة، والإنتاج الإعلامي المبتكر، وتطوير الحلول التقنية الحديثة، مع الحفاظ على أعلى معايير الأخلاق والنزاهة والاحترام المتبادل.
              <br /><br />
              تحدد سياسة العمل هذه المعايير والتوقعات والمسؤوليات التي تحكم بيئة عملنا وتوجّه سلوكنا اليومي كمؤسسة رائدة في خدمة المجتمع المدني والإعلامي وحقوق الإنسان.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">1. الغرض والأهداف</h2>
            <p>
              يهدف هذا الميثاق والسياسة الداخلية إلى ترسيخ وتوضيح المعايير المهنية والسلوكية التي يتعهد جميع أعضاء فريق بيت الصحافة بالالتزام بها. تهدف هذه السياسة إلى ضمان حماية حقوق العاملين، وتوفير بيئة عمل عادلة، وتعزيز الإنتاجية والابتكار المستمر في كافة مسارات عمل المؤسسة.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">2. فلسفتنا في العمل والإنتاج</h2>
            <p className="mb-4">نؤمن في بيت الصحافة بأن الصحافة الاستثنائية والحلول التنموية المبتكرة تُبنى على ركائز صلبة من القيم والمبادئ المشتركة:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">المهنية المطلقة والاحترام</span>
                <span className="text-sm text-slate-600">التعامل مع الزملاء والشركاء والجمهور بأعلى درجات الكفاءة والاحترام المتبادل للفروق الفردية.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">التنوع والشمول الإيجابي</span>
                <span className="text-sm text-slate-600">تقدير الخلفيات والخبرات المتنوعة، وإشراك الجميع بعدالة ودون أي تمييز أو إقصاء.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">التعلم والابتكار الرقمي</span>
                <span className="text-sm text-slate-600">السعي المستمر لتطوير المهارات وتطويع التكنولوجيا والذكاء الاصطناعي لخدمة أهداف الصحافة والمجتمع.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">المسؤولية وحرية التعبير</span>
                <span className="text-sm text-slate-600">الدفاع عن حرية التعبير البنّاءة المقترنة بالمسؤولية الأخلاقية والمهنية الصارمة.</span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">3. تكافؤ الفرص وعدم التمييز</h2>
            <p className="mb-4">
              يُعدّ بيت الصحافة جهة عمل تكفل وتضمن تكافؤ الفرص الكامل لكافة المتقدمين والعاملين فيها. وتعتمد قرارات التوظيف، والتكليف بمهام، والترقية والتقدير حصرياً وبشكل موضوعي على:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 mr-4">
              <li>المؤهلات العلمية والعملية والقدرات الفنية والشخصية.</li>
              <li>الخبرة المكتسبة وجودة الأداء والإنجاز الفعلي.</li>
              <li>الاحتياجات والأهداف الاستراتيجية والتشغيلية للمؤسسة.</li>
            </ul>
            <p>
              ونحن نحظر تماماً وبشكل قاطع أي شكل من أشكال التمييز المباشر أو غير المباشر القائم على النوع الاجتماعي (الجنس)، أو السن، أو الإعاقة، أو الجنسية، أو العرق، أو الانتماء الإثني، أو الدين، أو الرأي السياسي والفكري، أو الحالة الاجتماعية، أو أي خصائص أخرى محمية بموجب القوانين ذات الصلة.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">4. التنوع والشمول</h2>
            <p>
              نحن ملتزمون بخلق بيئة عمل يشعر فيها كل موظف وعضو بالانتماء والتقدير وتُحفظ فيها كرامته الإنسانية. ونحن نشجع باستمرار تبادل الآراء البنّاءة، وصنع القرار التشاركي والشامل، وضمان مشاركة الجميع بشكل متساوٍ في كافة الأنشطة والمشاريع، ودعم التعاون العابر للثقافات والخبرات داخل فريقنا. ولن يتم التسامح مطلقاً مع أي نزعة إقصائية أو محاولات للتخويف أو التهميش.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">5. السلوكيات المتوقعة في بيئة العمل</h2>
            <p className="mb-2">يُتوقع من كل موظف، مستشار، متطوع، أو شريك لبيت الصحافة الالتزام بالسلوكيات الإيجابية التالية:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mr-4">
              <li>معاملة جميع الزملاء، والمتدربين، والزوار بمهنية واحترام وود دائم.</li>
              <li>احترام الاختلافات والخصوصيات الثقافية والشخصية للآخرين.</li>
              <li>التواصل بشكل بناء وحضاري وحل الخلافات عبر الحوار المفتوح والناضج.</li>
              <li>تجنب استخدام أي لغة مسيئة، أو مهينة، أو غير لائقة في مكان العمل أو عبر المنصات الرقمية.</li>
              <li>دعم العمل الجماعي ومساعدة الزملاء لضمان نجاح المشاريع المشتركة.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">6. مكافحة المضايقات والتحرش (عدم التسامح المطلق)</h2>
            <p className="mb-4">
              يتبنى بيت الصحافة سياسة حازمة وصارمة تقوم على مبدأ عدم التسامح المطلق تجاه أي شكل من أشكال المضايقات، أو التحرش، أو التنمر في بيئة العمل أو عبر الفضاء الرقمي. ويشمل ذلك:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 mr-4">
              <li>المضايقات اللفظية أو البصرية أو السلوكية في مكان العمل.</li>
              <li>التحرش الجنسي بكافة أشكاله وصوره وأي سلوكيات ذات إيحاءات غير لائقة.</li>
              <li>الإساءة أو الإيذاء النفسي، والتهديد، والتخويف، أو السلوك العدائي والمستمر.</li>
              <li>العنف الجسدي أو التهديد المباشر أو غير المباشر به.</li>
              <li>التحرش الرقمي والتنمر الإلكتروني (Cyberbullying) بكافة وسائله وقنواته.</li>
            </ul>
            <p>
              تلتزم المؤسسة بالتعامل مع كافة البلاغات والشكاوى المتعلقة بهذا الشأن بمنتهى السرية والجدية والسرعة والعدالة، واتخاذ أشد العقوبات الرادعة بحق مرتكبي هذه الانتهاكات بما في ذلك إنهاء الخدمة والملاحقة القانونية.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">7. السلوك المهني والنزاهة والسمعة المؤسسية</h2>
            <p>
              يُتوقع من الموظفين ممارسة أعمالهم بأعلى مستويات الأمانة والنزاهة المهنية والشخصية، واحترام مبادئ النشر والخصوصية، وحماية أصول وممتلكات المؤسسة المادية والرقمية من التلف أو الهدر أو إساءة الاستخدام. كما يلتزم الجميع بتجنب أي سلوكيات أو ارتباطات خارجية قد تؤدي إلى تضارب في المصالح أو تضر بشكل مباشر أو غير مباشر بسمعة ومكانة بيت الصحافة في المجتمع.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">8. الحضور والالتزام بمواعيد العمل</h2>
            <p>
              يُعدّ الحضور المنتظم والالتزام بمواعيد العمل جزءاً أصيلاً من الكفاءة المهنية والمسؤولية الوظيفية. يجب على الموظف التواجد في ساعات العمل المقررة، وإخطار المشرف المباشر أو إدارة الموارد البشرية مسبقاً وفوراً في حالات الغياب أو التأخر الطارئ، والالتزام التام بتسليم المهام وإنجاز المشاريع في مواعيدها المحددة.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">9. نظام العمل عن بعد والعمل الهجين</h2>
            <p className="mb-4">
              نظراً لطبيعة المشاريع والتطور التقني، قد تدعم المؤسسة لبعض الوظائف والتخصصات نظام العمل عن بعد (Remote) أو العمل الهجين (Hybrid) والدوام المرن. ويُشترط في هذه الحالات:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 mr-4">
              <li>المحافظة الكاملة على مستويات الكفاءة، وجودة المخرجات، والإنتاجية العالية المعتادة.</li>
              <li>تأمين وحفظ سرية كافة المعلومات والوثائق الفنية والمؤسسية في مكان العمل الخارجي.</li>
              <li>الحضور والمشاركة الفعالة في كافة الاجتماعات التنسيقية واللقاءات الدورية المقررة عبر الإنترنت.</li>
              <li>ضمان توفر اتصال إنترنت آمن ومستقر ووسائل تواصل هاتفية ورقمية متاحة خلال ساعات العمل المتفق عليها.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">10. السلامة والصحة المهنية</h2>
            <p>
              يضع بيت الصحافة سلامة وصحة كوادره على رأس أولوياته التشغيلية، ويلتزم بتوفير بيئة عمل مادية آمنة ومجهزة بالكامل للوقاية من المخاطر. ويجب على الموظفين الالتزام بكافة تعليمات وإجراءات السلامة، والإبلاغ الفوري عن أي مخاطر أو أعطال في بيئة العمل، والمحافظة على سلامة المعدات والأدوات المودعة في عهدتهم واستخدامها بمسؤولية تامة.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">11. الصحة النفسية والرفاهية الوظيفية</h2>
            <p>
              نحن نؤمن بأن استقرار وسلامة الموظف النفسية هي المحرك الأساسي للإبداع والتميز الصحفي والتنموي. لذا، يلتزم المدراء بتشجيع التوزيع الصحي والمتوازن لأعباء العمل، وتحديد مواعيد واقعية ومعقولة للمشاريع، وإتاحة قنوات تواصل مفتوحة وداعمة لتقليل الضغوط وتعزيز التوازن الصحي بين الحياة المهنية والشخصية (Work-life balance). كما نشجع كوادرنا دائماً على التعبير وطلب المساعدة والدعم متى واجهتهم أي ضغوط أو تحديات تؤثر على استقرارهم ورفاهيتهم النفسية.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">12. التعلم والتطوير المهني المستمر</h2>
            <p>
              يستثمر بيت الصحافة بوعي ومسؤولية في التطوير المستمر وبناء القدرات الفنية والمعرفية لكوادره. نحن نحرص على رعاية ودعم المشاركة في البرامج التدريبية المتقدمة، وورش العمل التخصصية، والمؤتمرات الإقليمية والدولية، وتسهيل الفرص البحثية والأكاديمية، وتعزيز الوعي الرقمي والتعامل الفعال مع الذكاء الاصطناعي والتطور الصحفي المبتكر. نؤمن بأن السعي المستمر نحو التعلم مدى الحياة هو السبيل لمواكبة التغيرات المتسارعة وتقديم رسالة إعلامية وتنموية متميزة.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">13. المبادئ الأخلاقية للصحافة والنشر الإعلامي</h2>
            <p className="mb-4">
              يلتزم كافة الصحفيين والباحثين والمحررين العاملين في بيت الصحافة أو المساهمين في منصاته التحريرية بالمعايير المهنية والأخلاقية الرفيعة للعمل الصحفي، والتي تشمل:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
              <div className="border-r-2 border-slate-200 pr-3">
                <span className="font-bold text-slate-900 block">الدقة والتحقق الفني</span>
                <span className="text-sm text-slate-600">التثبت المطلق من صحة المعلومات والوقائع ومقاطعتها مع مصادر متعددة وموثوقة قبل النشر.</span>
              </div>
              <div className="border-r-2 border-slate-200 pr-3">
                <span className="font-bold text-slate-900 block">الاستقلالية والموضوعية</span>
                <span className="text-sm text-slate-600">النأي بالعمل الإعلامي والبحثي عن أي تحيزات شخصية أو تأثيرات خارجية تخل بالأمانة المهنية.</span>
              </div>
              <div className="border-r-2 border-slate-200 pr-3">
                <span className="font-bold text-slate-900 block">حماية المصادر الصحفية</span>
                <span className="text-sm text-slate-600">الالتزام الصارم والأخلاقي والسرية المطلقة في حماية هوية المصادر التي تطلب عدم الكشف عنها.</span>
              </div>
              <div className="border-r-2 border-slate-200 pr-3">
                <span className="font-bold text-slate-900 block">الشفافية والمسؤولية</span>
                <span className="text-sm text-slate-600">الإقرار بالخطأ علناً وتصحيحه فوراً وبمنتهى الشفافية، واحترام كرامة الإنسان وتجنب التحريض أو الكراهية.</span>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">14. الاستخدام المسؤول للذكاء الاصطناعي (AI)</h2>
            <p className="mb-4">
              يدعم بيت الصحافة الابتكار التكنولوجي والاستفادة من تقنيات الذكاء الاصطناعي كأداة مساعدة وفعالة لزيادة الإنتاجية والتحليل وتطوير المحتوى، شريطة الالتزام بالضوابط التالية:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 mr-4">
              <li>التدقيق والتحقق البشري الشامل والنهائي من كافة المعلومات والمخرجات المولدة بواسطة الذكاء الاصطناعي قبل اعتمادها أو نشرها لمنع التضليل.</li>
              <li>الالتزام التام بعدم تحميل أو مشاركة أي بيانات، أو وثائق داخلية، أو ملفات سرية وحساسة مع نماذج وأنظمة الذكاء الاصطناعي العامة والمفتوحة.</li>
              <li>الإفصاح بوضوح وشفافية للجمهور والإدارة عن أي محتوى أو بحث أو تغطية تمت الاستعانة في إنتاجها بتقنيات الذكاء الاصطناعي بشكل جوهري.</li>
              <li>احترام حقوق الملكية الفكرية وتجنب الانتحال العلمي أو الفكري أو سرقة النصوص والأفكار (Plagiarism).</li>
            </ul>
            <p className="font-medium text-slate-900">
              يجب أن يظل الذكاء الاصطناعي وسيلة داعمة لتمكين الكفاءات البشرية—ولا يحل بأي حال من الأحوال بدلاً عن الضمير الصحفي والحكم المهني المستقل للموظف.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">15. أمن وحماية المعلومات الرقمية والبيانات الحساسة</h2>
            <p>
              تقع على عاتق الجميع مسؤولية حماية وتأمين الأصول المعلوماتية والبيانات الحساسة للمؤسسة والشركاء والمستفيدين والضحايا المسجلين في مراصدنا وحمايتها من الاختراق أو الفقدان أو التسريب. يُحظر تماماً مشاركة أو كشف كلمات المرور، أو صلاحيات الدخول الرقمية، أو تصدير الوثائق والملفات والتقارير والمسودات التحريرية خارج النطاق الرسمي والمصرح به للمؤسسة تحت أي ظرف كان.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">16. استخدام الأجهزة والأدوات والموارد المؤسسية</h2>
            <p>
              يجب المحافظة التامة والعناية الفائقة بكافة الأجهزة والمعدات والأصول والممتلكات المادية والرقمية التي تضعها المؤسسة تحت تصرف الموظف لإنجاز مهامه. يُمنع استخدام هذه الموارد للأغراض الشخصية غير المصرح بها، ويجب الإبلاغ فوراً عن أي أعطال أو تلفيات أو فقدان للأجهزة لتسجيلها واتخاذ إجراءات الصيانة أو التحديث البرمجي اللازم لضمان أمنها.
            </p>
          </section>

          {/* Section 17 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">17. استخدام وسائل التواصل الاجتماعي الشخصية</h2>
            <p>
              بينما يحترم بيت الصحافة الحرية الكاملة لكوادره في التعبير عن آرائهم وتفاعلاتهم الشخصية عبر حساباتهم الخاصة على منصات التواصل الاجتماعي، يجب الانتباه والالتزام بعدم الإفصاح عن أي معلومات أو وثائق داخلية تخص عمل المؤسسة، وتجنب الإيحاء أو التصريح بنطق مواقف رسمية باسم بيت الصحافة ما لم يتوفر تفويض مكتوب بذلك، ومراعاة أن السلوك الرقمي الشخصي ينعكس بشكل غير مباشر على الصورة المهنية للمؤسسة.
            </p>
          </section>

          {/* Section 18 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">18. تضارب المصالح والشفافية المهنية</h2>
            <p>
              يلتزم كافة الموظفين بالإفصاح الفوري والكامل والشفاف للإدارة التنفيذية عن أي مواقف، أو ارتباطات خارجية، أو مصالح مالية وتجارية، أو قبول هدايا ومنافع من أطراف ثالثة، أو علاقات شخصية وأسرية قد تتقاطع مع أعمال ومشاريع بيت الصحافة أو تؤثر سلباً على عدالة وموضوعية ونزاهة القرارات المهنية والإدارية والمالية المتخذة.
            </p>
          </section>

          {/* Section 19 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">19. الإبلاغ عن الانتهاكات والمخاوف (الحماية والسرية)</h2>
            <p>
              نحن نشجع بقوة وندعم كافة الزملاء والموظفين على الإبلاغ الفوري عن أي سلوكيات غير مهنية، أو مضايقات، أو تجاوزات مالية وأخلاقية، أو ثغرات أمنية، أو انتهاكات لبنود سياسة العمل هذه يلاحظونها داخل بيئة العمل أو المشاريع. وتلتزم المؤسسة بالتعامل مع كافة التقارير بمنتهى الجدية والسرية التامة، وتوفير الحماية القانونية والمؤسسية الكاملة للمبلغين بحسن نية من أي إجراءات عقابية أو تمييزية أو انتقامية ضدهم.
            </p>
          </section>

          {/* Section 20 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">20. السرية المهنية واستمرار الالتزام</h2>
            <p>
              تُعد المحافظة على سرية البيانات والملفات والوثائق والمعلومات الداخلية التي يطلع عليها الموظف بحكم تواجده في بيت الصحافة التزاماً أخلاقياً وقانونياً صارماً ومستمراً. ويمتد هذا الالتزام ويظل سارياً بفعالية كاملة حتى بعد انتهاء العلاقة التعاقدية أو الوظيفية للموظف مع المؤسسة دون حد زمني مالم يتم الإفصاح عنها رسمياً من قبل الإدارة.
            </p>
          </section>

          {/* Section 21 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">21. رعاية ثقافة التميز والتحسين المستمر</h2>
            <p>
              يعمل بيت الصحافة بشكل مستمر على ترسيخ ورعاية ثقافة عمل إيجابية وملهمة تقوم على الثقة والصدق المتبادل، والتعاون والعمل التشاركي البنّاء لتبادل الخبرات، وتحمل المسؤولية الفردية والجماعية بشفافية، والسعي الدائم والملتزم نحو تحقيق التميز والجودة العالية والتحسين المستمر في كافة البرامج والمخرجات التنموية والإعلامية للمؤسسة.
            </p>
          </section>

          {/* Section 22 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">22. الالتزام بالسياسة والجزاءات الإدارية</h2>
            <p>
              يُعد التوقيع والالتزام التام ببنود وأحكام سياسة العمل هذه جزءاً أصيلاً ومكملاً لعقد العمل والارتباط المؤسسي ببيت الصحافة. وقد يؤدي انتهاك هذه السياسة أو الإخلال بأي من بنودها السلوكية والأخلاقية إلى اتخاذ الإجراءات التصحيحية والتأديبية والجزاءات الإدارية المناسبة المتوافقة مع اللوائح الإدارية والقوانين والتشريعات ذات الصلة.
            </p>
          </section>

          {/* Section 23 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-r-4 border-slate-900 pr-4">23. المراجعة الدورية وتطوير السياسات</h2>
            <p>
              تخضع سياسة العمل هذه للمراجعة الدورية والتطوير المستمر من قبل الإدارة القانونية والإدارية لبيت الصحافة لضمان مواكبتها لنمو وتوسع أنشطة ومشاريع المؤسسة، وتلبية المتطلبات التشغيلية والتكنولوجية المتجددة، ومواءمة أفضل الممارسات واللوائح المعمول بها محلياً وعالمياً.
            </p>
          </section>

          {/* Footer Callout */}
          <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden mt-12 text-center">
            <div className="relative z-10">
              <p className="text-slate-300 text-lg mb-6 font-medium">
                بيت الصحافة - اليمن
                <br />
                بناء المعرفة. تمكين الصحافة. ريادة المجتمع.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="mailto:info@ph-ye.org" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wide text-slate-900 transition-all duration-200 bg-white border border-transparent rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                  للاستفسارات والمخاوف الإدارية والـ HR
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 text-justify text-slate-700 leading-relaxed font-sans">
          {/* Header Metadata block */}
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium mb-4">
              <span>Version: 1.0</span>
              <span className="text-slate-300">|</span>
              <span>Effective Date: July 2026</span>
              <span className="text-slate-300">|</span>
              <span className="text-amber-600 font-bold">Applies to: Employees, Consultants, Interns, Volunteers, Fellows, Contractors, and Visitors</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">1. Purpose</h2>
            <p className="text-lg text-slate-800 leading-relaxed">
              Press House is committed to providing a professional, inclusive, safe, and collaborative workplace that empowers employees to produce high-quality journalism, research, training, media production, and technology solutions while maintaining the highest standards of ethics, integrity, and respect.
              <br /><br />
              This Workplace Policy establishes the standards, expectations, and responsibilities that govern our working environment.
            </p>
          </div>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">2. Our Workplace Philosophy</h2>
            <p className="mb-4">We believe that exceptional journalism and innovation are built on:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Professionalism & Respect</span>
                <span className="text-sm text-slate-600">Treating colleagues, partners, and the public with the highest standard of competence and mutual respect.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Diversity & Inclusion</span>
                <span className="text-sm text-slate-600">Valuing diverse perspectives and experiences, involving everyone fairly without discrimination.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Continuous Learning & AI Literacy</span>
                <span className="text-sm text-slate-600">Constantly improving skills, responsibly using tech and AI to elevate journalistic and social impact.</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Accountability & Transparency</span>
                <span className="text-sm text-slate-600">Taking responsibility for our work and defending freedom of expression with strict ethical boundaries.</span>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">3. Equal Opportunity</h2>
            <p className="mb-4">
              Press House is an equal opportunity employer. Employment decisions are based solely on:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 ml-4">
              <li>Qualifications, skills, and professional competencies.</li>
              <li>Relevant experience, quality of work, and performance history.</li>
              <li>Organizational needs and strategic plans.</li>
            </ul>
            <p>
              We prohibit discrimination based on gender, age, disability, nationality, ethnicity, religion, political opinion, marital status, or any other protected characteristic under applicable legislation.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">4. Diversity and Inclusion</h2>
            <p>
              We are committed to creating a workplace where everyone is treated with dignity and respect. We encourage diverse perspectives, inclusive decision-making, equal participation, respectful communication, and cross-cultural collaboration. Discrimination, exclusion, or intimidation will not be tolerated.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">5. Respectful Workplace</h2>
            <p className="mb-2">Every employee and team member is expected to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Treat colleagues and visitors professionally and courteously.</li>
              <li>Respect individual and cultural differences.</li>
              <li>Communicate constructively and resolve disagreements professionally.</li>
              <li>Avoid abusive, demeaning, or inappropriate language under all circumstances.</li>
              <li>Support teamwork and foster a healthy, cooperative working spirit.</li>
            </ul>
            <p className="mt-4">
              Bullying, harassment, intimidation, retaliation, and hostile behavior are strictly prohibited.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">6. Anti-Harassment</h2>
            <p className="mb-4">
              Press House maintains zero tolerance for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 ml-4">
              <li>Workplace harassment and psychological abuse.</li>
              <li>Sexual harassment in any form, verbal or physical.</li>
              <li>Threats, intimidation, or physical violence.</li>
              <li>Verbal abuse and personal targeting.</li>
              <li>Online harassment, stalking, or cyberbullying.</li>
            </ul>
            <p>
              All complaints will be investigated confidentially, fairly, and swiftly. Appropriate corrective and disciplinary actions, up to termination and legal prosecution, will be enforced.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">7. Professional Conduct</h2>
            <p className="mb-2">Employees are expected to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-4">
              <li>Act honestly, maintaining the highest levels of integrity.</li>
              <li>Respect and protect organizational confidentiality.</li>
              <li>Protect organizational assets, preventing waste or unauthorized use.</li>
              <li>Avoid and disclose any potential conflicts of interest immediately.</li>
              <li>Represent Press House professionally in all public forums and engagements.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">8. Attendance and Working Hours</h2>
            <p>
              Regular attendance and punctuality are vital components of professional capability and reliability. Employees should arrive on time, maintain regular attendance, notify supervisors of absences as early as possible, meet project deadlines, and coordinate leave requests in advance whenever possible. Flexible scheduling may be approved where operationally appropriate.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">9. Remote and Hybrid Work</h2>
            <p className="mb-4">
              Depending on operational requirements, some positions and teams may support remote work, hybrid work, or flexible schedules. Remote employees are expected to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 ml-4">
              <li>Maintain consistent productivity and work quality.</li>
              <li>Protect confidential information in their remote working environment.</li>
              <li>Participate actively in scheduled digital meetings and updates.</li>
              <li>Meet agreed-upon working hours and maintain reliable communication lines.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">10. Workplace Safety</h2>
            <p>
              Press House is committed to maintaining a safe, healthy, and hazard-free workplace. Employees must follow safety procedures, use equipment responsibly, report any workplace hazards or failures immediately, and participate in emergency preparedness and evacuation training as required.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">11. Psychological Wellbeing</h2>
            <p>
              Employee wellbeing is essential to institutional creativity and excellence. Managers should actively encourage healthy workloads, reasonable project deadlines, open and supportive communication, work-life balance, and supportive leadership. Employees are strongly encouraged to seek guidance and support whenever workplace challenges or external pressures affect their psychological wellbeing.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">12. Learning and Professional Development</h2>
            <p>
              Press House invests heavily in continuous learning and capacity building. We support training programs, workshops, professional conferences, research opportunities, mentorship, technical certifications, AI literacy, and journalism innovation. We believe that a lifelong learning mindset is crucial for personal growth and for delivering high-impact journalism and research.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">13. Ethical Journalism</h2>
            <p className="mb-4">
              Employees engaged in editorial work, reporting, or publication must follow core ethical principles:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
              <div className="border-l-2 border-slate-200 pl-3">
                <span className="font-bold text-slate-900 block">Accuracy & Verification</span>
                <span className="text-sm text-slate-600">Thoroughly verify facts, cross-checking information with multiple reliable sources before publication.</span>
              </div>
              <div className="border-l-2 border-slate-200 pl-3">
                <span className="font-bold text-slate-900 block">Independence & Fairness</span>
                <span className="text-sm text-slate-600">Ensuring objective reporting, free from external influence or personal bias that compromises integrity.</span>
              </div>
              <div className="border-l-2 border-slate-200 pl-3">
                <span className="font-bold text-slate-900 block">Source Protection</span>
                <span className="text-sm text-slate-600">An absolute commitment to maintaining the confidentiality of sensitive journalistic sources.</span>
              </div>
              <div className="border-l-2 border-slate-200 pl-3">
                <span className="font-bold text-slate-900 block">Accountability & Respect</span>
                <span className="text-sm text-slate-600">Admitting errors transparently, avoiding hate speech, and respecting human dignity.</span>
              </div>
            </div>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">14. Artificial Intelligence (AI)</h2>
            <p className="mb-4">
              AI tools may be used responsibly to improve efficiency and content research, subject to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 mb-4 ml-4">
              <li>Verifying and fact-checking all AI-generated output rigorously before publication.</li>
              <li>Protecting confidential or proprietary data by never uploading internal files to public AI models.</li>
              <li>Disclosing substantial AI assistance in research or content production when appropriate.</li>
              <li>Avoiding plagiarism, respecting copyrights, and preserving human editorial oversight.</li>
            </ul>
            <p className="font-medium text-slate-900">
              AI must support—not replace—professional human judgment, conscience, and expertise.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">15. Information Security</h2>
            <p>
              Employees must safeguard sensitive information, including personal data, internal strategies, donor records, financial documents, research drafts, and journalistic sources. Unauthorized disclosure, sharing of access credentials, or misuse of organizational information is strictly prohibited and subject to legal and disciplinary actions.
            </p>
          </section>

          {/* Section 16 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">16. Equipment and Resources</h2>
            <p>
              Organizational equipment, devices, and digital subscriptions must be used responsibly and solely for authorized professional purposes. Employees must prevent misuse, report any damages or loss immediately, keep their devices physically and digitally secure, and maintain updated security software.
            </p>
          </section>

          {/* Section 17 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">17. Social Media</h2>
            <p>
              While respecting individual freedom of expression, employees must ensure that their personal social media activities do not compromise Press House's reputation, leak confidential information, or imply official representation without written authorization. Professional conduct and ethical boundaries extend to digital networks.
            </p>
          </section>

          {/* Section 18 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">18. Conflicts of Interest</h2>
            <p>
              Employees must declare any financial interest, outside employment, gifts, or personal relationships that could influence or appear to influence their professional judgment and decisions. Transparency protects both the individual and the integrity of Press House.
            </p>
          </section>

          {/* Section 19 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">19. Reporting Concerns</h2>
            <p>
              Employees are encouraged to report misconduct, harassment, safety hazards, ethical issues, fraud, security incidents, or policy violations. Reports made in good faith will be handled with strict confidentiality, and whistleblowers are fully protected from retaliation or negative consequences.
            </p>
          </section>

          {/* Section 20 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">20. Confidentiality</h2>
            <p>
              The obligation to safeguard confidential information obtained through our work remains a binding legal and ethical duty during employment and continues indefinitely after the professional association with Press House ends.
            </p>
          </section>

          {/* Section 21 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">21. Workplace Culture</h2>
            <p>
              Press House promotes a healthy, positive institutional culture built on trust, mutual respect, intellectual curiosity, constructive collaboration, innovation, accountability, and a persistent drive for quality and excellence.
            </p>
          </section>

          {/* Section 22 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">22. Policy Compliance</h2>
            <p>
              Compliance with this policy is a condition of employment and contracting at Press House. Failure to comply with these rules or violating the ethical guidelines may result in corrective actions or disciplinary measures, up to termination of services, in accordance with administrative procedures and applicable laws.
            </p>
          </section>

          {/* Section 23 */}
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 border-l-4 border-slate-900 pl-4">23. Policy Review</h2>
            <p>
              This Workplace Policy is reviewed periodically to reflect organizational growth, operational needs, legal developments, technological changes, and evolving global best practices in the civil society and media sector.
            </p>
          </section>

          {/* Footer Callout */}
          <div className="bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden mt-12 text-center">
            <div className="relative z-10">
              <p className="text-slate-300 text-lg mb-6 font-medium">
                Press House
                <br />
                Building Knowledge. Strengthening Journalism. Empowering Society.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="mailto:info@ph-ye.org" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wide text-slate-900 transition-all duration-200 bg-white border border-transparent rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
                  Contact HR & Administration
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </LegalPage>
  );
}

