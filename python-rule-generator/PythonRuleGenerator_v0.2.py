import time
start_time=time.time()
import csv
import os

#PythTest = open("PythonGeneratedRules.txt","w")
os.makedirs("Rule Generator Output",exist_ok=True)
PythTest = open("Rule Generator Output/" + input("Give a name for the generated rules file: "),"w")

#Define PREFIX And SELECT Function
def PrefixIntro():
#PREFIX and INTRO Template	
	PythTest.write("PREFIX dct: <http://purl.org/dc/terms/>\n")
	PythTest.write("PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n")
	PythTest.write("PREFIX owl: <http://www.w3.org/2002/07/owl#>\n")
	PythTest.write("PREFIX vcard: <http://www.w3.org/2006/vcard/ns>\n")
	PythTest.write("PREFIX v: <http://www.w3.org/2006/vcard/ns#>\n")
	PythTest.write("PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n")
	PythTest.write("PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n")
	PythTest.write("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n")
	PythTest.write("PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n")
	PythTest.write("PREFIX cpsvapit: <http://dati.gov.it/onto/cpsvapit#>\n")
	PythTest.write("PREFIX dcatapit: <http://dati.gov.it/onto/dcatapit#>\n")
	PythTest.write("PREFIX locn: <https://www.w3.org/ns/locn#>\n")
	PythTest.write("PREFIX dataeu: <http://data.europa.eu/m8g/>\n")
	PythTest.write("PREFIX cpsv: <http://purl.org/vocab/cpsv#>\n")
	PythTest.write("PREFIX dcat: <http://www.w3.org/ns/dcat#>\n")
	PythTest.write("PREFIX adms: <http://www.w3.org/ns/adms#>\n")
	PythTest.write("PREFIX spdx: <http://spdx.org/rdf/terms#>\n")
	PythTest.write("PREFIX schema: <http://schema.org/>\n")
	PythTest.write("\n")
	PythTest.write("SELECT ?Class_Name ?Rule_ID ?Rule_Severity ?Rule_Description ?Message (?s AS ?Subject) (?p AS ?Predicate) (?o AS ?Object)\n")
	PythTest.write("WHERE{\n")
	PythTest.write("GRAPH <@@@TOKEN-GRAPH@@@> {\n")
	PythTest.write("\n")

#Define CLOSING BRACKETS Function
def ClosingBrackets():
#CLOSING BRACKETS Template
	PythTest.write("\n")
	PythTest.write("}\n")
	PythTest.write("}\n")

#Define MIN Rule Function
def MinRule(mainclass,mainproperty,rulnum):
#MIN RULE TEMPLATE
	PythTest.write("UNION\n")
	PythTest.write("# Rule_ID:"+str(rulnum)+" "+mainclass+" - "+mainproperty+" MIN\n")
	PythTest.write("  {SELECT ?Class_Name ?Rule_ID ?Rule_Severity ?Rule_Description ?Message ?s ?p\n")
	PythTest.write("    WHERE {\n")
	PythTest.write("      ?s a "+mainclass+".\n")
	PythTest.write("      FILTER(!EXISTS {?s "+mainproperty+" ?name}).\n")
	PythTest.write("      BIND ("+mainproperty+" AS ?p).\n")
	PythTest.write("      BIND ('"+mainclass+"' AS ?Class_Name).\n")
	PythTest.write("      BIND ("+str(rulnum)+" AS ?Rule_ID).\n")
	PythTest.write("      BIND ('error' AS ?Rule_Severity).\n")
	PythTest.write("      BIND ('"+mainproperty+" is a required property for "+mainclass+".' AS ?Rule_Description).\n")
	PythTest.write("      BIND (concat('The "+mainclass+" ',str(?s),' does not have a "+mainproperty+" property.') AS ?Message).\n")
	PythTest.write("    }\n")
	PythTest.write("  }\n")
	PythTest.write("\n")


#Define USAGE Rule Function
def UsageRule(mainclass,mainproperty,proprange,rulnum):
#USAGE RULE TEMPLATE
	PythTest.write("UNION\n")
	PythTest.write("# Rule_ID:"+str(rulnum)+" "+mainclass+" - "+mainproperty+" USAGE\n")
	PythTest.write("  {SELECT DISTINCT ?Class_Name ?Rule_ID ?Rule_Severity ?Rule_Description ?Message ?s ?p ?o\n")
	PythTest.write("   WHERE {\n")
	PythTest.write("     ?s a "+mainclass+".\n")
	PythTest.write("     ?s "+mainproperty+" ?o.\n")
	PythTest.write("     ?o ?p ?val.\n")
	PythTest.write("     FILTER(!EXISTS {?o a "+proprange+"}).\n")
	PythTest.write("     BIND ('"+mainclass+"' AS ?Class_Name).\n")
	PythTest.write("     BIND ("+str(rulnum)+" AS ?Rule_ID).\n")
	PythTest.write("     BIND ('error' AS ?Rule_Severity).\n")
	PythTest.write("     BIND ('"+mainproperty+" should be a "+proprange+".' AS ?Rule_Description).\n")
	PythTest.write("     BIND (concat('"+mainclass+" ',str(?s),' does not have a "+mainproperty+" property of type "+proprange+".') AS ?Message).\n")
	PythTest.write("   }\n")
	PythTest.write("  }\n")
	PythTest.write("\n")

#Define USAGE LITERAL Rule Function
def UsageLitRule(mainclass,mainproperty,rulnum):
#USAGE LITERAL RULE TEMPLATE
	PythTest.write("UNION\n")
	PythTest.write("# Rule_ID:"+str(rulnum)+" "+mainclass+" - "+mainproperty+" USAGE Literal\n")
	PythTest.write("  {SELECT ?Class_Name ?Rule_ID ?Rule_Severity ?Rule_Description ?Message ?s ?p ?o\n")
	PythTest.write("   WHERE {\n")
	PythTest.write("     ?s a "+mainclass+".\n")
	PythTest.write("     ?s "+mainproperty+" ?o.\n")
	PythTest.write("     FILTER(!isLiteral(?o)).\n")
	PythTest.write("     BIND ("+mainproperty+" AS ?p).\n")
	PythTest.write("     BIND ('"+mainclass+"' AS ?Class_Name).\n")
	PythTest.write("     BIND ("+str(rulnum)+" AS ?Rule_ID).\n")
	PythTest.write("     BIND ('error' AS ?Rule_Severity).\n")
	PythTest.write("     BIND ('The "+mainproperty+" property should be a literal.' AS ?Rule_Description).\n")
	PythTest.write("     BIND (concat('The property ',str(?p),' is not a literal.') AS ?Message).\n")
	PythTest.write("   }\n")
	PythTest.write("  }\n")
	PythTest.write("\n")

#Define USAGE URI Rule Function
def UsageURIRule(mainclass,mainproperty,rulnum):
#USAGE LITERAL RULE TEMPLATE
	PythTest.write("UNION\n")
	PythTest.write("# Rule_ID:"+str(rulnum)+" "+mainclass+" - "+mainproperty+" USAGE URI\n")
	PythTest.write("  {SELECT ?Class_Name ?Rule_ID ?Rule_Severity ?Rule_Description ?Message ?s ?p ?o\n")
	PythTest.write("   WHERE {\n")
	PythTest.write("     ?s a "+mainclass+".\n")
	PythTest.write("     ?s "+mainproperty+" ?o.\n")
	PythTest.write("     FILTER(!isURI(?o)).\n")
	PythTest.write("     FILTER(!datatype(?o) = xsd:anyURI).\n")
	PythTest.write("     BIND ("+mainproperty+" AS ?p).\n")
	PythTest.write("     BIND ('"+mainclass+"' AS ?Class_Name).\n")
	PythTest.write("     BIND ("+str(rulnum)+" AS ?Rule_ID).\n")
	PythTest.write("     BIND ('error' AS ?Rule_Severity).\n")
	PythTest.write("     BIND ('The "+mainproperty+" property should be a URI.' AS ?Rule_Description).\n")
	PythTest.write("     BIND (concat('The property ',str(?p),' is not a URI.') AS ?Message).\n")
	PythTest.write("   }\n")
	PythTest.write("  }\n")
	PythTest.write("\n")

#Define USAGE URI Rule Function
def UsageDateTimeRule(mainclass,mainproperty,rulnum):
#USAGE LITERAL RULE TEMPLATE
	PythTest.write("UNION\n")
	PythTest.write("# Rule_ID:"+str(rulnum)+" "+mainclass+" - "+mainproperty+" USAGE DateTime\n")
	PythTest.write("  {SELECT ?Class_Name ?Rule_ID ?Rule_Severity ?Rule_Description ?Message ?s ?p ?o\n")
	PythTest.write("   WHERE {\n")
	PythTest.write("     ?s a "+mainclass+".\n")
	PythTest.write("     ?s "+mainproperty+" ?o.\n")
	PythTest.write("     FILTER(!datatype(?o) = xsd:dateTime).\n")
	PythTest.write("     BIND ("+mainproperty+" AS ?p).\n")
	PythTest.write("     BIND ('"+mainclass+"' AS ?Class_Name).\n")
	PythTest.write("     BIND ("+str(rulnum)+" AS ?Rule_ID).\n")
	PythTest.write("     BIND ('error' AS ?Rule_Severity).\n")
	PythTest.write("     BIND ('The "+mainproperty+" property should be a literal of type xsd:DateTime.' AS ?Rule_Description).\n")
	PythTest.write("     BIND (concat('The property ',str(?p),' is not a a literal of type xsd:DateTime.') AS ?Message).\n")
	PythTest.write("   }\n")
	PythTest.write("  }\n")
	PythTest.write("\n")

#Define MAX Rule Function
def MaxRule(mainclass,mainproperty,rulnum):
#MAX RULE TEMPLATE
	PythTest.write("UNION\n")
	PythTest.write("# Rule_ID:"+str(rulnum)+" "+mainclass+" - "+mainproperty+" MAX\n")
	PythTest.write("  {SELECT ("+ mainclass +" AS ?Class_Name) ("+str(rulnum)+" AS ?Rule_ID) ('error' AS ?Rule_Severity) ('"+mainproperty+" has maximum cardinality of 1 for "+mainclass+".' AS ?Rule_Description) (concat('The "+mainclass+"',str(?s),' has more than 1 "+mainproperty+".') AS ?Message) ?s ("+mainproperty+" AS ?p) (sample(?spa) AS ?o)\n""")
	PythTest.write("   WHERE {\n")
	PythTest.write("     ?s a %s.\n" %mainclass)
	PythTest.write("     ?s %s ?spa.\n" %mainproperty)
	PythTest.write("   } GROUP BY ?s\n")
	PythTest.write("     HAVING (COUNT( ?s) > 1)\n")
	PythTest.write("  }\n")
	PythTest.write("\n")


#Define MANDATORY CLASS Rule Function
def MandatoryClassRule(mainclass,rulnum):
#MANDATORY CLASS RULE TEMPLATE
	PythTest.write("UNION\n")
	PythTest.write("# Rule_ID:"+str(rulnum)+" "+mainclass+" - MANDATORY Class\n")
	PythTest.write("  {SELECT ?Class_Name ?Rule_ID ?Rule_Severity ?Rule_Description ?Message\n")
	PythTest.write("   WHERE {\n")
	PythTest.write("     FILTER(!EXISTS {?s a "+mainclass+"}).\n")
	PythTest.write("     BIND ("+mainclass+" AS ?Class_Name).\n")
	PythTest.write("     BIND ("+str(rulnum)+" AS ?Rule_ID).\n")
	PythTest.write("     BIND ('error' AS ?Rule_Severity).\n")
	PythTest.write("     BIND ('"+mainclass+" does not exist.' AS ?Rule_Description).\n")
	PythTest.write("     BIND (concat('The mandatory class "+mainclass+" does not exist.') AS ?Message).\n")
	PythTest.write("   }\n")
	PythTest.write("  }\n")  
	PythTest.write("\n")

#with open("CPSV-AP.v2_Rules.csv") as CSVTest:
with open(input("Give name or path of the CSV file: ")) as CSVTest:
	readCSV = csv.reader(CSVTest, delimiter = ";")
	next(readCSV)
	i=1
	PrefixIntro()
	for row in readCSV:
		print(i)
		if row[2] == "1":
			print("Created rule for MINIMUM CARDINALITY for "+row[1]+" property of "+row[0])
			MinRule(row[0],row[1],i)
			i+=1
		if row[3] == "1":
			print("Created rule for MAXIMUM CARDINALITY for "+row[1]+" property of "+row[0])
			MaxRule(row[0],row[1],i)
			i+=1
		if row[4] != "0":
			if row[4] == "Mandatory" or row[4] == "mandatory" or row[4] == "MANDATORY":
				print("Created MANDATORY CLASS rule for "+row[0])
				MandatoryClassRule(row[0],i)
				i+=1
			elif row[4] == "Literal" or row[4] == "literal" or row[4] == "LITERAL":
				print("Created USAGE LITERAL rule for "+row[1]+" property of "+row[0])
				UsageLitRule(row[0],row[1],i)
				i+=1
			elif row[4] == "URI" or row[4] == "uri":
				print("Created USAGE URI rule for "+row[1]+" property of "+row[0])
				UsageURIRule(row[0],row[1],i)
				i+=1
			elif row[4] == "DATETIME" or row[4] == "datetime" or row[4] == "DateTime":
				print("Created USAGE DateTime rule for "+row[1]+" property of "+row[0])
				UsageDateTimeRule(row[0],row[1],i)
				i+=1
			else:
				print("Created USAGE rule for "+row[1]+" property of "+row[0])
				UsageRule(row[0],row[1],row[4],i)
				i+=1
		
	ClosingBrackets()

	
	print(">\n")
	print(">\n")
	print("Number of rules generated: "+str(i))


#
#Add an error detection feature where if the value for the usage rule is wrong the rule is still generated but with 
#an ERROR and the rule number is provided so it can be checked up and corrected manualy
#

CSVTest.close()

PythTest.close()

print("Generated in: %s seconds." % (time.time() - start_time))