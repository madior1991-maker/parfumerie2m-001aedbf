create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  category text not null,
  excerpt text not null,
  content text not null,
  cover_image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.blog_posts enable row level security;

create policy "Public can view published blog posts"
on public.blog_posts
for select
using (is_published = true);

create policy "Admins can manage blog posts"
on public.blog_posts
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger update_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.update_updated_at_column();

create index idx_blog_posts_slug on public.blog_posts(slug);
create index idx_blog_posts_published_sort on public.blog_posts(is_published, sort_order, created_at desc);

insert into public.blog_posts (title, slug, category, excerpt, content, sort_order, is_published) values
(
  'Quel parfum choisir pour la chaleur au Sénégal ?',
  'parfum-chaleur-senegal',
  'Guide d''achat',
  'Découvrez les familles olfactives qui tiennent mieux sous la chaleur, sans perdre en élégance ni en présence.',
  $$Sous la chaleur, la bonne signature olfactive n’est pas forcément la plus forte: c’est celle qui reste lisible, élégante et confortable pendant plusieurs heures.

Les muscs propres, les agrumes nets, les fruités lumineux et certains floraux transparents gardent une belle présence sans devenir lourds. Quand la température monte, les parfums très sucrés ou très denses peuvent saturer plus vite; mieux vaut chercher de la fraîcheur et de la netteté.

Appliquez le parfum sur peau hydratée et laissez-le respirer. Deux à quatre vaporisations suffisent souvent pour la journée. Pour le bureau ou les sorties en journée, privilégiez des sillages propres et subtils plutôt qu’une projection trop forte.$$,
  1,
  true
),
(
  'Les parfums les plus demandés à Dakar cette saison',
  'parfums-demandes-dakar',
  'Tendances',
  'Un aperçu des styles qui montent en visibilité: gourmands, musqués propres, ambre et signatures plus puissantes.',
  $$Les préférences changent vite, mais certaines familles ressortent régulièrement quand les clients cherchent une signature marquante ou facile à porter.

Les profils gourmands, les muscs propres et les ambrés modernes restent très demandés parce qu’ils sont à la fois accessibles et reconnaissables. Les parfums plus opulents séduisent aussi lorsqu’il faut marquer une présence le soir ou pour une occasion spéciale.

Partez de votre usage réel: travail, sorties, rendez-vous ou cadeau. Un parfum tendance n’est utile que s’il s’accorde à votre rythme. Comparez ensuite les notes, la concentration et la tenue plutôt que de vous arrêter au nom seul.$$,
  2,
  true
),
(
  'Comment reconnaître un parfum authentique',
  'authenticite-parfum',
  'Authenticité',
  'Les bons réflexes pour éviter les contrefaçons et acheter avec plus de confiance en ligne.',
  $$Quand on achète un parfum en ligne, le but n’est pas de devenir expert en emballage: il faut surtout repérer les signaux de confiance qui comptent vraiment.

Regardez la cohérence entre le nom, les notes, la concentration et les visuels. Une fiche produit sérieuse est claire et stable. Un vendeur fiable affiche aussi des moyens de contact visibles, une présence cohérente sur les réseaux et des informations de livraison lisibles.

Comparez le parfum avec la boutique, puis si besoin posez vos questions avant de commander. Le temps de réponse en dit souvent long. Pour les cadeaux ou les achats plus importants, privilégiez les références connues et les collections déjà présentées sur le site.$$,
  3,
  true
),
(
  'Parfum de bureau, parfum du soir: les bons réflexes',
  'parfum-bureau-soir',
  'Usage',
  'Une sélection simple pour adapter votre sillage au contexte, au climat et à votre style personnel.',
  $$Le parfum de bureau doit rester lisible et discret, tandis que le parfum du soir peut être plus dense, plus chaud et plus affirmé.

Pour la journée, les sillages propres, les muscs nets et les agrumes fonctionnent très bien. Le soir, vous pouvez passer sur des notes ambrées, boisées ou plus enveloppantes si vous voulez davantage de présence.

Si vous hésitez encore, partez d’un usage concret: travail, sortie, rendez-vous ou cadeau. C’est souvent le meilleur moyen de choisir rapidement le bon parfum.$$,
  4,
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  category = excluded.category,
  excerpt = excluded.excerpt,
  content = excluded.content,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published,
  updated_at = now();
