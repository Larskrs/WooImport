function getModel (data) {
    const model = { 
        Ordrenr: data.id, 
        KundeNummer: data.customer_id,
        Status : data.status,
        TotalSum : data.total,
        Moms : data.total_tax,
        Selgernr1 : "selgernr1",
        Dekningsbidrag : data.discount_total,
        Kundenavn : data.billing.first_name + " " + data.billing.last_name,
        Adresse : data.billing.address_1,
        Adresse_2 : data.billing.address_2,
        Postnummer : data.billing.postcode,
        Poststed : data.billing.city,
        Blank : "",
        OrdreDato : data.date_created,
        LeveringsDato : data.date_created,
        NettoSum : data.total,
        Momsprosent : data.total_tax * 100 / data.total,
        Blank : "",
        Blank : "",
        Land : data.billing.country,
        Vår_ref : "",
        Deres_ref : "",
        Fritekst : "",
        Dim2 : "",
        Høy_moms : 0,
        Lav_moms : 0,
        Leveringsadresse : data.shipping.address_1,
        Rekvisisjon : "",
        Prosjekt : "", 
                    };
    console.log(data);
    console.log(model);
       return model;
}

module.exports = { getModel };