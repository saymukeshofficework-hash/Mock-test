import json,glob,re
src=glob.glob('/root/.claude/projects/-home-user-Mock-test/*/tool-results/mcp-Google_Drive-search_files-1791195000960.txt')[0]
first=json.load(open(src))['files']
page2=[("1_jyRO6q_YDtwA5s2C9J6ZOvBJEkMJ0KK","Chapter 4 - Ganit mein Shikshan Adhigam - Study Material 1.pdf","1r9JcviPwjIu999r-ONjHb3HJVL_01g2H",770022),
("1Dp8InYUdL-_w8YhQkifUnazTZqPQ01sB","Chapter 1 - The World Around Us - Study Material 1.pdf","1Tmf777WvHPRUp2tmhmg4grul5tlakixO",445840),
("1gr4hgvCynTCzbyJrMSK5w-c6F8bqRpTG","Chapter 6 - Lekhan ko samajhna - Study Material 1.pdf","1uMqytWS3nDYZUqy6IRj9K3OvR3Yd19AG",2281866),
("1FvLCdY8y4qrvpsG-1YmDmui5TkWB-wbD","Chapter 2 - Balyawastha aur samajikaran - Study Material 1.pdf","17jAk5bk1jwwtSasZhroQfrpUBT7ty351",371182),
("1xZVMKXFrPCXb5EhJIgaXZfT8wR-v8mn5","Chapter 1 - Pathyacharya - Study Material 1.pdf","1G1K-huelQJps85CwZN4i9hVgCCOrhDtm",939967),
("1WgLuo4Hmwzyl2NqZxyUivVGrf0fl9S9j","Chapter 3 - sawaya ki bhartiya awadharna - Study Material 1.pdf","17jAk5bk1jwwtSasZhroQfrpUBT7ty351",483128),
("19V-6jM3v4lXIstfXENaI2NreYWlrBS08","Chapter 2 - Bacchon ke vicharon aur awadharno ko samajhna - Study Material 1.pdf","1Tmf777WvHPRUp2tmhmg4grul5tlakixO",364359),
("1AwOv6bbSW8B6xRsRrtKoPQUdGqQOW1no","Chapter 3 - Ganitiya Sanchaar - Study Material 1.pdf","1r9JcviPwjIu999r-ONjHb3HJVL_01g2H",1035102)]
LP="1AruE1H-RT6jnH7nvvEvPXsel3I8fOGyA"
lp="""1lbX9dwUYGuwAgAD7CCvxxlWzGNQtqdabeMCjrGt8rIg|LP 40 - TWAU Class 5 - Forests Wildlife and Ecological Balance
1ibYcxpkXuo8Nkb-cGjBuW0m7caMi3B-KLiGu9_rAE1c|NIOS Bridge Course (Course 547) — 40 Lesson Plans Master Curriculum Blueprint & Framework
1R3zv8SefYt_qMoIcWBhuXDzEiXk16G5PpHgLsJX-jq0|LP 01 - Hindi Class 1 - Meena Ka Parivar
1gaRBSr14cZ9ZZLAQXjWFVA0Xb8JIfrW8kIYysPmEFxo|LP 03 - Hindi Class 2 - Haat Bazaar Chitra Varnan
18NwutA3CsBilWiQVik2pQkrKYj8KzK1P7-3No72Eb5E|LP 02 - Hindi Class 1 - Jhula Kavita
1q2t_HAbhKViyAXU5kGxgxbjEnT5Q3cUPoIDclM-VD-g|LP 30 - Maths Class 5 - Data Handling and Pictographs
1vzBnQI4V3498T_WChFeetKMyQECxEk0VVWF2Q6auzMQ|LP 29 - Maths Class 5 - Perimeter and Area Concepts
1EDDE5OdVffpoWbXAg6gMumyfMIXObE-xwx-maGq7heg|LP 20 - English Class 5 - Descriptive Paragraph Writing
1Nx7E39RL2Of8lLgD88guge1ey2Wo9XAWklVbOeTMkUg|LP 19 - English Class 5 - Teamwork (Poem)
1e5q2Fe6oXdqMUe4vqdfLaW5RRmy9v5mg65G9ivjlrOs|LP 10 - Hindi Class 5 - Samvaad Lekhan Ped Aur Balak
1xhtQ4fgdcE25YfsG_zOff92kpNbIB3qWUHz08-jvt0w|LP 28 - Maths Class 4 - Measurement of Length (m and cm)
1YqWLcEk4cCSNyALh13JDUt_CAxlk4k69vh50OcErW8Q|LP 09 - Hindi Class 5 - Raakh Ki Rassi
1Vz8-NOm53JvHovsQrILOUr8WTH9Ho42pZs5koaArhBY|LP 18 - English Class 4 - Singular and Plural Nouns
1kSDYZLo8CA5jkoySsLrxZ2BNOZO7hFldq4EemSmj2Rc|LP 17 - English Class 4 - Alice in Wonderland
1Gbmwr4VTltpWfyGpTMnZkpB2epaeLetcCJC_vGywvWQ|LP 27 - Maths Class 4 - Introduction to Fractions
1uiGe0Cc4lHW--Xkj8q9-Zs9hIqdRQzm4mrXf2OuQ8oc|LP 39 - TWAU Class 5 - Mapping Our Neighbourhood and Directions
1JUGzwwqwRj6TiMqwLjuFyj6-bFrSdZcKiLCBWPp7X7I|LP 38 - TWAU Class 5 - Water Conservation and Rainwater Harvesting
1Ks0tEW0wMfrSz7lvyX1VY63ziRnjpWgOeaZEDRS1N_8|LP 08 - Hindi Class 4 - Patra Lekhan
10d-6lCfF0fBTr3utKD9zko08W2gAEyzCiCIYUYWWrkQ|LP 26 - Maths Class 3 - Multiplication as Repeated Addition
1LAez9LVr5V_q-vRRUI4haA0y-mqlcbKwjJvz9XMqlVg|LP 37 - TWAU Class 4 - Waste Management (3Rs and Cleanliness)
15tNPelb8_omVCw41zPLhzw7_-2cnMDuuvqPBUT59XwA|LP 07 - Hindi Class 4 - Daan Ka Hisab
12gGJNT0tRLpQpolMIkMwDFezcEzwHPebPeq-suxeP2k|LP 36 - TWAU Class 4 - Animals and Their Shelters
1yrt8awh9Z3kqxm3OT-Io59JzHn2-L-GYIqSqUUzrO38|LP 16 - English Class 3 - Action Words (Verbs)
1I-N09VFvSXNcmVpgMELjTVXcmHd1vr7LYC9ziLj0gJE|LP 15 - English Class 3 - Animals and Their Homes
1SDOOyYthBHIpPKrk4csCVeBA9GMXsFT2TDNnj3ae6xo|LP 25 - Maths Class 3 - 2D and 3D Shapes and Properties
1EE4X9QS0tdBzSgb_3mP8VS_Cmj4ihy65FdwwwNMBfrs|LP 06 - Hindi Class 3 - Sangya Ki Pehchan
1iFElfab8pc2nLZmPi1WLBUoPuHu3Qd9kmFx0ObCLbj4|LP 24 - Maths Class 2 - Addition without Regrouping
1PglztLx5EGyTKfLBKFQIeBnaM20s58l_x17jJmPiDOw|LP 05 - Hindi Class 3 - Ped Aur Pakshi
1D-U0wsQL5l13FgVMMVftgW5RV4OPGISg0Y8QXBoHoBs|LP 14 - English Class 2 - Phonics and CVC Words
1xE59yMKcFLmQO71APEQpIEciDM1VDVmG6__1Nzs6FAg|LP 13 - English Class 2 - Between Home and School
1tNP5rzrtTQXnxlRka-CQ6t_hanqmBESC834eVx9oUhs|LP 35 - TWAU Class 4 - Food for Health and Balanced Diet
1od19m-vpj8TIpo20DxYZHBz0OOqU1MxwJNu5HRkDyCc|LP 34 - TWAU Class 3 - World of Clay and Toys
1ETR4kQIJLpEk3sZzzvn4Ti0QwmUd90c7puCApMexbOE|LP 04 - Hindi Class 2 - Safai Aur Swasthya
1-c64zVuxCORLjfQHBzXyU9fwe5ynCyUwvWcnyiTQspI|LP 23 - Maths Class 2 - Place Value Tens and Ones
1-wrfkb-PbjVXPOJRHgLz4XYdXVu5ul8BV1WoG_izToc|LP 33 - TWAU Class 3 - Water is Precious (Sources and Uses)
1b5wGOlfeohGvPqwJhhthEbUTx6DTTZau3pQqEVxWxlY|LP 22 - Maths Class 1 - Numbers 1 to 9 and One to One Matching
1dsBXA0MbV0KcsEUKPYXA6oL066kQ-Lp5ZXHpwqIjFfg|LP 32 - TWAU Class 3 - Plants and Leaves Diversity
1WtHXO3CFFz4jli5HiiQ2uGNkkiTB997ghkqXq0qdSOk|LP 31 - TWAU Class 3 - Family and Friends Relationships
1tJS-18aCbIpiq7m1LFsxjoz1vvU8FV-HUKcdOJWDDcY|LP 12 - English Class 1 - Greetings and Self Introduction
1Ot0KER2LTHpgcLEHtiBSp2KaQMxrwF3z-fqbVrmTyjA|LP 11 - English Class 1 - Two Little Hands (Rhyme)
1ly-7vJherAhbBiEK6UUPJxwI0r90ItckVVajvpA4-w4|LP 21 - Maths Class 1 - Spatial Understanding and Shapes"""

SUBJ={"1uMRCdedzMPyIfnMw4g_3dTkPSa9ifWwe":("2.0 – Mukesh Notes","Pedagogy of The World Around Us"),
"1QUmCDNTAN4iBcy_Wu-xq3KHr2R1MH9G6":("2.0 – Mukesh Notes","Child Development and Educational Psychology"),
"122VMf7CVJvUcTKAAIvTn38exprsz_p6i":("2.0 – Mukesh Notes","Pedagogy of Language-I"),
"1M-zUC6OYHGzRSCGZT7G-uuNZZULKWfe9":("2.0 – Mukesh Notes","Curriculum, Pedagogy and Assessment"),
"1DEsIuP1uNZ18ruzGkBcA8KW0La1Z1gde":("2.0 – Mukesh Notes","Pedagogy of Language-II"),
"1HqDqfdq-uyNdeHoDFJXaziHtPGAGSEXx":("2.0 – Mukesh Notes","Pedagogy of Mathematics"),
"17jAk5bk1jwwtSasZhroQfrpUBT7ty351":("Study Material PDFs","Child Development and Educational Psychology"),
"1Tmf777WvHPRUp2tmhmg4grul5tlakixO":("Study Material PDFs","Pedagogy of The World Around Us"),
"15EIXFKZJ8yBgjRM_nLZGOpaYyf4a_Al8":("Study Material PDFs","Practicum - School Experience"),
"1uMqytWS3nDYZUqy6IRj9K3OvR3Yd19AG":("Study Material PDFs","Pedagogy of Language-I"),
"1amag331yCrHHI0HTPAMRkbbij84Nwf0q":("Study Material PDFs","Pedagogy of Language-II"),
"1G1K-huelQJps85CwZN4i9hVgCCOrhDtm":("Study Material PDFs","Curriculum, Pedagogy and Assessment"),
"1r9JcviPwjIu999r-ONjHb3HJVL_01g2H":("Study Material PDFs","Pedagogy of Mathematics"),
"13GZh1NgY0lq_hiKMoV0kVgKQNzy5Hh-U":("Rakesh Pandey Notes","Pedagogy of Language-I"),
"15mw_1LRG6CCTfjS4ZIP1yp1o9TOvrcRx":("Rakesh Pandey Notes","Pedagogy of The World Around Us"),
"1pKxE90zt_5j7XZ4XR7YfTpo-g498Pd37":("Rakesh Pandey Notes","Curriculum, Pedagogy and Assessment"),
"1PzFwA44br0LlOMO9ULgl1xfkQmiAVzYq":("Rakesh Pandey Notes","Pedagogy of Mathematics"),
"1JdZJaTxqehuFK0NbnwaqcV6QspJ1JQrR":("Rakesh Pandey Notes","Pedagogy of Language-II"),
"1utdYQ1BVUwquwef5P3DpCCJQKJyzlgTk":("Rakesh Pandey Notes","Child Development and Educational Psychology"),
LP:("Lesson Plans 2.0","40 Lesson Plans (Course 547)")}
rows=[];seen=set()
def add(i,t,mt,pid,size):
    if i in seen: return
    seen.add(i)
    g,s=SUBJ.get(pid,("Other","")); 
    rows.append([t,i,"pdf" if "pdf" in mt else "doc",round(int(size or 0)/1024),g,s])
for f in first: add(f["id"],f["title"],f["mimeType"],f["parentId"],f.get("fileSize"))
for i,t,p,sz in page2: add(i,t,"pdf",p,sz)
for line in lp.splitlines():
    i,t=line.split("|",1); add(i,t,"doc",LP,0)
rows.sort(key=lambda r:(r[4],r[5],r[0]))
open("files.js","w",encoding="utf-8").write("window.FILES="+json.dumps(rows,ensure_ascii=False)+";\n")
from collections import Counter
print(len(rows),Counter(r[4] for r in rows),Counter(r[2] for r in rows))
